export default class MachineBox {
    constructor(machine, context, state) {
        this.machine = machine;
        this.context = context;
        this.state = state;
        this.broken = false;
    }
}
