import { cleanEnv, num, str } from 'envalid';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
    }),
    PORT: num({ default: 3000 }),

    CORS: str({ default: '*' }),
    LOG_DIR: str({ default: './logs' }),

    CLIENT_URL: str({ default: ' http://localhost:4200/' }),
    DB_HOST: str({ default: undefined }),
    DB_SOCKET_PATH: str({ default: undefined }),
    DB_PORT: num(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),

    EMAIL: str({ default: undefined }),
    MJ_APIKEY_PUBLIC: str({ default: undefined }),
    MJ_APIKEY_PRIVATE: str({ default: undefined }),

    VAPID_PUBLIC_KEY: str({
        default:
            'BC7J1hDqhmWAb-N88JCvA_vgasQ433M8sD4Fl6qWyfiinOgW3qh62vJfrs2wWLg6I26JdsXwoXX2u7YS13XQbJA',
    }),
    VAPID_PRIVATE_KEY: str({
        default: 'A1Nj53Yi95sVuPCN_xpUjyCnf13xwKh03mf2tXj98VQ',
    }),

    JWT_SECRET: str({ default: '123' }),
});

export { env };
