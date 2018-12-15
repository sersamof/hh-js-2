import {
    getMachineBox,
    getCurrentMachineBox,
    transaction,
    unregisterBox,
} from '../src/transactions';
import MachineBox from '../src/domain/MachineBox';
import {
    NoOpenTransaction,
    StateMachineWasBroken,
    StateMachineError,
    NoSuchMachineBox,
    StateMachineInitializeError,
} from '../src/domain/errors';

import { createBox } from './utils';

describe('machine-box', () => {
    const simpleMachine = {
        desc: {
            id: 'vacancy',
            states: { notResponded: {} },
            actions: {},
        },
        initialContext: { id: 123 },
        initialState: 'notResponded',
    };
    const simpleMachine2 = {
        desc: {
            id: 'vacancy2',
            states: { notResponded: {} },
            actions: {},
        },
        initialContext: { id: 123 },
        initialState: 'notResponded',
    };

    it('getMachineBox and unregisterBox should work properly :)', () => {
        const box = createBox(simpleMachine);

        expect(getMachineBox(simpleMachine.desc.id)).toBe(box);
        unregisterBox(box);
        expect(() => getMachineBox(simpleMachine.desc.id)).toThrow(new NoSuchMachineBox());
    });

    it('initializeBox should return correct box with copy of inputs ', () => {
        const initialContext = { ...simpleMachine.initialContext };
        const expected = new MachineBox(
            { ...simpleMachine.desc },
            initialContext,
            simpleMachine.initialState
        );
        const actual = createBox(simpleMachine);

        expect(actual).toEqual(expected);
        expect(actual.context).not.toBe(initialContext);

        unregisterBox(actual);
    });

    it("initializeBox shouldn't register two machine with equal id", () => {
        const box = createBox(simpleMachine);

        const errorBox = () => createBox(simpleMachine);
        expect(errorBox).toThrow(
            new StateMachineInitializeError('Machine ' + simpleMachine.desc.id + ' already exists')
        );

        unregisterBox(box);
    });

    it('getCurrentMachineBox outside transaction should throw error', () => {
        const box = createBox(simpleMachine);

        expect(getCurrentMachineBox).toThrow(new NoOpenTransaction());

        unregisterBox(box);
    });

    it('getCurrentMachineBox in transaction should return right box', () => {
        const box1 = createBox(simpleMachine);
        const box2 = createBox(simpleMachine2);

        expect(transaction(box1)(getCurrentMachineBox)).toBe(box1);
        expect(transaction(box2)(getCurrentMachineBox)).toBe(box2);

        const nestedTransactions = (result) =>
            transaction(box1)(() => {
                transaction(box2)(() => {
                    result.box2 = getCurrentMachineBox();
                });

                result.box1 = getCurrentMachineBox();
            });
        const startTransactions = () => {
            const result = { box1: null, box2: null };
            nestedTransactions(result);
            return result;
        };
        const result = startTransactions();
        expect(result.box1).toBe(box1);
        expect(result.box2).toBe(box2);

        unregisterBox(box1);
        unregisterBox(box2);
    });

    it('transaction should provide right box', () => {
        const box1 = createBox(simpleMachine);
        const box2 = createBox(simpleMachine2);

        expect(transaction(box1)((mBox) => mBox)).toBe(box1);
        expect(transaction(box2)((mBox) => mBox)).toBe(box2);

        const nestedTransactions = (result) =>
            transaction(box1)((mBox) => {
                transaction(box2)((mBox) => {
                    result.box2 = mBox;
                });

                result.box1 = mBox;
            });
        const startTransactions = () => {
            const result = { box1: null, box2: null };
            nestedTransactions(result);
            return result;
        };
        const result = startTransactions();
        expect(result.box1).toBe(box1);
        expect(result.box2).toBe(box2);

        unregisterBox(box1);
        unregisterBox(box2);
    });

    it('machine should be broken if error in transaction', () => {
        const box = createBox(simpleMachine);

        const errorTransaction = () =>
            transaction(box)(() => {
                throw 'error';
            });
        const newTransaction = () =>
            transaction(box)(() => {
                const res = 1;
                return res;
            });
        expect(errorTransaction).toThrow(new StateMachineError('error'));
        expect(box.broken).toBeTruthy();
        expect(newTransaction).toThrow(new StateMachineWasBroken());

        unregisterBox(box);
    });
});
