import { transaction } from '../transactions';

export default function StateMachine(box) {
    this.id = box.machine.id;
    this.getState = () => box.state;
    this.getContext = () => {
        return { ...box.context };
    };
    this.isBroken = () => box.broken;

    this.transition = (...args) => {
        return new Promise((resolve, reject) => {
            try {
                transaction(box, ...args)((box) => box.transition(...args));
                resolve([this.getState(), this.getContext()]);
            } catch (err) {
                reject(err);
            }
        });
    };
}
