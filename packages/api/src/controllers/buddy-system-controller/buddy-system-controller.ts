import { NextFunction, Request, Response, Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { BuddySystemService } from '../../services/buddy-system-service/buddy-system-service';
import { auth } from '../../middlewares/auth';
import { validateUser } from '../../middlewares/validate-user';
import { BuddySystemEventCreation } from 'common/models/buddy-system';
import { UserRequest } from '../../types/requests';

@singleton()
export class BuddySystemController extends AbstractController {
    constructor(private readonly buddySystemService: BuddySystemService) {
        super('/buddy-system');
    }

    protected configureRouter(router: Router): void {
        router.get(
            '/',
            auth,
            validateUser,
            async (req: UserRequest, res: Response, next: NextFunction) => {
                try {
                    res.status(StatusCodes.OK).json(
                        await this.buddySystemService.getBuddySystemEvents(
                            req.body.session.user.userId,
                        ),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );

        router.get(
            '/:buddySystemEventId',
            auth,
            validateUser,
            async (
                req: Request<{ buddySystemEventId: string }>,
                res: Response,
                next: NextFunction,
            ) => {
                try {
                    res.status(StatusCodes.OK).json(
                        await this.buddySystemService.getBuddySystemEvent(
                            parseInt(req.params.buddySystemEventId, 10),
                        ),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post(
            '/',
            auth,
            validateUser,
            async (
                req: Request<object, BuddySystemEventCreation>,
                res: Response,
                next: NextFunction,
            ) => {
                try {
                    res.status(StatusCodes.CREATED).json(
                        await this.buddySystemService.createBuddySystemEvent(
                            req.body,
                        ),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
