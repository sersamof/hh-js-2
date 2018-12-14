import { machine, useContext, useState } from './src';

const proc = () => Promise.resolve('');
const vacancyMachine = machine({
    id: 'vacancy',
    initialState: 'notResponded',
    context: { id: 123 },
    states: {
        responded: {
            onEntry: 'onStateEntry',
        },
        notResponded: {
            onExit() {
                console.log('we are leaving notResponded state');
            },
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        console.log(
                            'start proc1',
                            vacancyMachine.getContext(),
                            machineToBroke.getContext()
                        );
                        machineToBroke.transition('RESPOND', {
                            resume: {
                                name: 'Vasya',
                                lastName: 'Pupkin',
                            },
                        });
                        const [context2, setContext2] = useContext();
                        setContext2({ machine2DidntBreakUs: 'yes' });
                        proc({
                            method: 'post',
                            data: {
                                resume: event.resume,
                                vacancyId: context.id,
                            },
                        })
                            .then(() => {
                                setState('responded');
                                setContext({ completed: true });
                            })
                            .then(() => {
                                setContext({ afterUpdateVac2: true });
                            })
                            .then(() => {
                                console.log(
                                    'done proc1',
                                    vacancyMachine.getContext(),
                                    machineToBroke.getContext()
                                );
                            });
                    },
                    //target: 'responded',
                },
            },
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
        /*makeResponse: (event) => {
			// both sync and async actions
			const [contex, setContext] = useContext()			
			window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id} })
		}*/
    },
});

const machineToBroke = machine({
    id: 'vacancy2',
    initialState: 'notResponded',
    context: { id: 1234 },
    states: {
        responded: {
            onEntry: 'onStateEntry',
        },
        notResponded: {
            onExit() {
                console.log('we are leaving notResponded state');
            },
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        console.log(
                            'start proc2',
                            vacancyMachine.getContext(),
                            machineToBroke.getContext()
                        );
                        proc({
                            method: 'post',
                            data: {
                                resume: event.resume,
                                vacancyId: context.id,
                            },
                        })
                            .then(() => {
                                setState('responded');
                                setContext({ completed: true });
                            })
                            .then(() => {
                                console.log(
                                    'done proc2',
                                    vacancyMachine.getContext(),
                                    machineToBroke.getContext()
                                );
                            });
                    },
                },
            },
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            console.log('now state is ' + state);
        },
        /*makeResponse: (event) => {
			// both sync and async actions
			const [contex, setContext] = useContext()			
			window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id} })
		}*/
    },
});

vacancyMachine
    .transition('RESPOND', {
        resume: { name: 'Vasya', lastName: 'Pupkin' },
    })
    .then(console.log);

setTimeout(() => {
    vacancyMachine.transition('wrongTransition').catch(console.log);
    console.log(vacancyMachine.isBroken());
}, 1000);
