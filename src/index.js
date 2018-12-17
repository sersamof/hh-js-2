import MachineDescription from './domain/MachineDescription';
import StateMachine from './domain/StateMachine';
import { StateMachineInitializeError } from './domain/errors';

const { initializeBox, getCurrentMachineBox, transaction } = require('./transactions');

const machine = (desc) => {
    if (
        desc.states === undefined ||
        desc.initialState === undefined ||
        desc.states[desc.initialState] === undefined
    ) {
        throw new StateMachineInitializeError('you should provide initial state from states');
    }

    const machineDesc = new MachineDescription(desc);
    const box = initializeBox(machineDesc, desc.context, desc.initialState);
    return new StateMachine(box);
};

const useContext = () => {
    const box = getCurrentMachineBox();
    return [{ ...box.context }, (...args) => box.setContext(...args)];
};

const useState = () => {
    const box = getCurrentMachineBox();
    return [
        box.state,
        (state, event) => transaction(box, state, event)((box, ...args) => box.setState(...args)),
    ];
};

export { machine, useContext, useState };
