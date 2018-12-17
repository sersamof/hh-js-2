class StateMachineError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }
}

class StateMachineInitializeError extends StateMachineError {}

class UnknownTransition extends StateMachineError {
    constructor(transition, state) {
        super("Unknown transition " + transition + " for state " + state);
    }
}

class UnknownAction extends StateMachineError {
    constructor(action, transition, state) {
        super("Unknown action " + action + " on " + transition + " in " + state);
    }
}

class NoOpenTransaction extends StateMachineError {
    constructor() {
        super("No open transaction");
    }
}

class StateMachineWasBroken extends StateMachineError {
    constructor() {
        super("machine was broken");
    }
}

class NoSuchMachineBox extends StateMachineError {
    constructor() {
        super("no such machineBox");
    }
}

export {
    StateMachineError,
    StateMachineInitializeError,
    UnknownTransition,
    UnknownAction,
    NoSuchMachineBox,
    NoOpenTransaction,
    StateMachineWasBroken,
};
