import { singleton } from 'tsyringe';
import knex, { Knex } from 'knex';
import { env } from '../../utils/environment';

@singleton()
export class DatabaseService {
    private db?: Knex;

    get database(): Knex {
        if (!this.db) {
            throw new Error('Database not instantiated');
        }

        return this.db;
    }

    async instantiate(): Promise<void> {
        this.db = knex({
            client: 'mysql2',
            connection: {
                host: env.DB_HOST,
                port: env.DB_PORT,
                user: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_DATABASE,
            },
        });

        await this.db.migrate.latest();
    }

    isConnected(): boolean {
        return !!this.db;
    }
}
