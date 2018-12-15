import MachineBox from './domain/MachineBox';
import {
    NoOpenTransaction,
    StateMachineWasBroken,
    StateMachineError,
    NoSuchMachineBox,
    StateMachineInitializeError,
} from './domain/errors';
// при выполнении транзакции возможен вызов операций другого автомата,
// поэтому нам нужен стэк автоматов
const current = [];
const getCurrentMachineBox = () => {
    if (current.length === 0) {
        throw new NoOpenTransaction();
    }
    return current[current.length - 1];
};

const transaction = (machineBox, ...args) => (fun) => {
    if (machineBox.broken) {
        throw new StateMachineWasBroken();
    }

    try {
        current.push(machineBox);
        const retVal = fun(machineBox, ...args);
        return retVal;
    } catch (err) {
        machineBox.broken = true;
        if (err instanceof StateMachineError) {
            throw err;
        } else {
            throw new StateMachineError(err);
        }
    } finally {
        current.pop();
    }
};

const machineBoxes = {};
const getMachineBox = (machineId) => {
    if (machineBoxes[machineId] === undefined) {
        throw new NoSuchMachineBox();
    }
    return machineBoxes[machineId];
};

const initializeBox = (machine, initialContext, initialState) => {
    if (machineBoxes[machine.id] !== undefined) {
        throw new StateMachineInitializeError('Machine ' + machine.id + ' already exists');
    }

    machineBoxes[machine.id] = new MachineBox(machine, { ...initialContext }, initialState);
    return machineBoxes[machine.id];
};

const unregisterBox = (box) => {
    machineBoxes[box.machine.id] = undefined;
};

export { getMachineBox, initializeBox, getCurrentMachineBox, transaction, unregisterBox };
