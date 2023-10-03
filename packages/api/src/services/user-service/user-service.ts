import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { User, UserValidation } from 'common/models/user';
import { Knex } from 'knex';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    private get userValidations(): Knex.QueryBuilder<UserValidation> {
        return this.databaseService.database<UserValidation>('userValidations');
    }

    async getUser(userId: number): Promise<User> {
        const user = await this.userValidations
            .select()
            .where({ userId })
            .first();

        if (!user) {
            throw new HttpException('User not found', StatusCodes.NOT_FOUND);
        }

        return user;
    }
}
