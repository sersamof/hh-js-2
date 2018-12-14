import { UnknownTransition, UnknownAction } from "./domain/errors";

const getActionOrBreakMachine = (machineBox, transitionName) => {
    const transitions = machineBox.machine.states[machineBox.state].on;
    if (transitions === undefined || transitions[transitionName] === undefined) {
        machineBox.broken = true;
        throw new UnknownTransition(transitionName, machineBox.state);
    }
    return transitions[transitionName];
};

const transition = (machineBox) => (transitionName, event) => {
    trigger(machineBox)("onExit", machineBox.state, event);
    const action = getActionOrBreakMachine(machineBox, transitionName);
    if ("service" in action) {
        action.service(event);
    } else if ("target" in action) {
        setState(machineBox)(action.target, event);
    }
};

// позволяет тригернуть обработчики события on стейта state машины machine с данными event
const trigger = (machineBox) => (on, state, event) => {
    const maybeMapActionNameToHandler = (action) => {
        if (typeof action === "string") {
            if (action in machine.actions) {
                return machine.actions[action];
            } else {
                machineBox.broken = true;
                throw new UnknownAction(action, on, state);
            }
        }
        return action;
    };

    const machine = machineBox.machine;
    const handlers = [machine.states[state][on]]; // дабы не обрабатывать отдельно случаи array / not array
    handlers
        .reduce((acc, val) => acc.concat(val), []) // flatMap in stage-3 :(
        .map(maybeMapActionNameToHandler)
        .filter((handler) => typeof handler === "function")
        .forEach((handler) => handler(event));
};

const setContext = (machineBox) => (context) => {
    const currentContext = machineBox.context;
    const updated = { ...currentContext, ...context };
    machineBox.context = updated;
    return { ...updated };
};

const setState = (machineBox) => (state, event) => {
    trigger(machineBox)("onExit", machineBox.state, event);
    machineBox.state = state;
    trigger(machineBox)("onEntry", state, event);
    return machineBox.state;
};

export { trigger, transition, setContext, setState };
