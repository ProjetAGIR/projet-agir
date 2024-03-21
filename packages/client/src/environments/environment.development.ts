export const environment = {
    production: false,
    ws: {
        url: 'ws://localhost:3000',
        reconnectInterval: 5000,
        reconnectAttempts: 5,
    },
    api: {
        url: 'http://localhost:3000',
    },
    notifications: {
        vapidPublicKey:
            'BC7J1hDqhmWAb-N88JCvA_vgasQ433M8sD4Fl6qWyfiinOgW3qh62vJfrs2wWLg6I26JdsXwoXX2u7YS13XQbJA',
    },
};
