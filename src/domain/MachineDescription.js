export default class MachineDescription {
    constructor(desc) {
        this.id = desc.id;
        this.states = { ...desc.states };
        this.actions = { ...desc.actions };
    }
}
