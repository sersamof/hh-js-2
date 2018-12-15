import { UnknownTransition, UnknownAction } from './errors';

const getActionOrBreakMachine = (machineBox, transitionName) => {
    const transitions = machineBox.machine.states[machineBox.state].on;
    if (transitions === undefined || transitions[transitionName] === undefined) {
        machineBox.broken = true;
        throw new UnknownTransition(transitionName, machineBox.state);
    }
    return transitions[transitionName];
};

// позволяет тригернуть обработчики события on стейта state машины machine с данными event
const trigger = (machineBox, on, state, event) => {
    const maybeMapActionNameToHandler = (action) => {
        if (typeof action === 'string') {
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
        .filter((handler) => typeof handler === 'function')
        .forEach((handler) => handler(event));
};

export default class MachineBox {
    constructor(machine, context, state) {
        this.machine = machine;
        this.context = context;
        this.state = state;
        this.broken = false;
    }

    transition(transitionName, event) {
        trigger(this, 'onExit', this.state, event);
        const action = getActionOrBreakMachine(this, transitionName);
        if ('service' in action) {
            action.service(event);
        } else if ('target' in action) {
            this.setState(action.target, event);
        }
    }

    setContext(context) {
        const currentContext = this.context;
        const updated = { ...currentContext, ...context };
        this.context = updated;
        return { ...updated };
    }

    setState(state, event) {
        trigger(this, 'onExit', this.state, event);
        this.state = state;
        trigger(this, 'onEntry', state, event);
        return this.state;
    }
}
