import MachineDescription from './domain/MachineDescription';
import StateMachine from './domain/StateMachine';
import { StateMachineInitializeError } from './domain/errors';

const { initializeBox, getCurrentMachineBox, transaction } = require('./transactions');
const { setContext, setState: rawSetState } = require('./operations');

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

const setState = (box) => (state, event) => transaction(box)(rawSetState)(state, event);

const useContext = () => [
    { ...getCurrentMachineBox().context },
    setContext(getCurrentMachineBox()),
];
const useState = () => [getCurrentMachineBox().state, setState(getCurrentMachineBox())];

export { machine, useContext, useState };
