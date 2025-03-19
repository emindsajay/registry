export default {
    routes: [
        {
            method: 'POST',
            path: '/network-participant/subscribe',
            handler: 'network-participant.subscribe',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
