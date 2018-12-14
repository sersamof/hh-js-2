import { machine, useContext, useState } from "../src";
import { unregisterMachine } from "./utils";
import StateMachine from "../src/domain/StateMachine";
import {
    StateMachineInitializeError,
    NoOpenTransaction,
    UnknownTransition,
    UnknownAction,
} from "../src/domain/errors";

describe("public api", () => {
    const simpleMachineDesc = {
        id: "vacancy",
        states: { notResponded: { on: { move: () => {} } }, responded: {} },
        context: { id: 123, data: 234 },
        initialState: "notResponded",
    };

    it("machine should create state machine", () => {
        const stateMachine = machine(simpleMachineDesc);

        expect(stateMachine).toBeInstanceOf(StateMachine);

        unregisterMachine(stateMachine);
    });

    it("should be error if unknown initialState", () => {
        const machineDesc = { ...simpleMachineDesc };
        machineDesc.initialState = "wrong";

        expect(() => machine(machineDesc)).toThrow(
            new StateMachineInitializeError("you should provide initial state from states")
        );

        delete machineDesc.initialState;
        expect(() => machine(machineDesc)).toThrow(
            new StateMachineInitializeError("you should provide initial state from states")
        );
    });

    it("useState and useContext should throw error when called outside", () => {
        const stateMachine = machine(simpleMachineDesc);

        expect(useState).toThrow(new NoOpenTransaction());
        expect(useContext).toThrow(new NoOpenTransaction());

        unregisterMachine(stateMachine);
    });

    it("setContext should merge context", () => {
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: {
                    on: {
                        move: {
                            service: (event) => {
                                const [context, setContext] = useContext();
                                setContext(event);
                            },
                        },
                    },
                },
                responded: {},
            },
            context: { id: 123, data: 234 },
            initialState: "notResponded",
        };
        const expected = [
            machineDesc.initialState,
            {
                ...machineDesc.context,
                id: 22,
                add: 55,
            },
        ];
        const stateMachine = machine(machineDesc);

        const promise = stateMachine.transition("move", { id: 22, add: 55 });

        return expect(promise)
            .resolves.toEqual(expected)
            .then(() => unregisterMachine(stateMachine));
    });

    it("should be error for unknown transition", () => {
        const stateMachine = machine(simpleMachineDesc);

        const promise = stateMachine.transition("smth");

        return expect(promise)
            .rejects.toThrow(new UnknownTransition("smth", "notResponded"))
            .then(() => unregisterMachine(stateMachine));
    });

    it("trigger may be an action", () => {
        let flag = [false, false, false];
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: {
                    onExit: "test",
                    on: { move: { target: "responded" } },
                },
                responded: {
                    onEntry: ["test1", "test2"],
                },
            },
            actions: {
                test: () => {
                    flag[0] = true;
                },
                test1: () => {
                    flag[1] = true;
                },
                test2: () => {
                    flag[2] = true;
                },
            },
            initialState: "notResponded",
        };
        const stateMachine = machine(machineDesc);

        const promise = stateMachine.transition("move").then(() => flag);

        return expect(promise)
            .resolves.toEqual([true, true, true])
            .then(() => unregisterMachine(stateMachine));
    });

    it("should be error for unknown action", () => {
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: { on: { move: { target: "responded" } } },
                responded: {
                    onEntry: "test",
                },
            },
            actions: {},
            initialState: "notResponded",
        };
        const expected = [true, new UnknownAction("test", "onEntry", "responded")];
        const stateMachine = machine(machineDesc);

        const promise = stateMachine
            .transition("move")
            .catch((err) => Promise.reject([stateMachine.isBroken(), err]));

        return expect(promise)
            .rejects.toEqual(expected)
            .then(() => unregisterMachine(stateMachine));
    });

    it("transition should transit machine through target", () => {
        let flagTarget = false;
        let flagService = false;
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: {
                    on: {
                        move: {
                            target: "responded",
                        },
                    },
                },
                responded: {
                    onEntry: () => {
                        flagTarget = true;
                    },
                    on: {
                        move: {
                            service: () => {
                                flagService = true;
                            },
                        },
                    },
                },
            },
            initialState: "notResponded",
        };
        const stateMachine = machine(machineDesc);
        const expected = [true, true];

        const promise = stateMachine
            .transition("move")
            .then(() => stateMachine.transition("move"))
            .then(() => [flagTarget, flagService]);

        return expect(promise)
            .resolves.toEqual(expected)
            .then(() => unregisterMachine(stateMachine));
    });

    it("setState should trigger onEntry and onExit", () => {
        let flagExit = false;
        let flagEntry = false;
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: {
                    onExit: () => {
                        flagExit = true;
                    },
                    on: { move: { target: "responded" } },
                },
                responded: {
                    onEntry: () => {
                        flagEntry = true;
                    },
                },
            },
            initialState: "notResponded",
        };
        const stateMachine = machine(machineDesc);
        const expected = [true, true];

        const promise = stateMachine.transition("move").then(() => [flagEntry, flagExit]);

        return expect(promise)
            .resolves.toEqual(expected)
            .then(() => unregisterMachine(stateMachine));
    });

    it("useState should return current state and setState for change state", () => {
        let beforeSetState = "wrong";
        const machineDesc = {
            id: "vacancy",
            states: {
                notResponded: {
                    on: {
                        move: {
                            service: (event) => {
                                const [state, setState] = useState();
                                beforeSetState = state;
                                setState("responded");
                            },
                        },
                    },
                },
                responded: {},
            },
            initialState: "notResponded",
        };
        const stateMachine = machine(machineDesc);
        const expected = [machineDesc.initialState, "responded"];

        const promise = stateMachine
            .transition("move")
            .then(() => [beforeSetState, stateMachine.getState()]);

        return expect(promise)
            .resolves.toEqual(expected)
            .then(() => unregisterMachine(stateMachine));
    });
});
