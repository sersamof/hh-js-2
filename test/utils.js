import { initializeBox, unregisterBox, getMachineBox } from "../src/transactions";

const createBox = (machineFullDesc) => {
    const machineDesc = { ...machineFullDesc.desc };
    const initialContext = { ...machineFullDesc.initialContext };
    const initialState = machineFullDesc.initialState;
    return initializeBox(machineDesc, initialContext, initialState);
};
const unregisterMachine = (machine) => {
    unregisterBox(getMachineBox(machine.id));
};
export { createBox, unregisterBox, unregisterMachine };
