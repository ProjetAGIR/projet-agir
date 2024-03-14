import { Response, Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { EventsService } from '../../services/events-service/events-service';
import { auth } from '../../middlewares/auth';
import { validateUser } from '../../middlewares/validate-user';
import { UserRequest } from '../../types/requests';
import { EventCreation } from 'common/models/events';

@singleton()
export class EventsController extends AbstractController {
    constructor(private readonly eventsService: EventsService) {
        super('/events');
    }

    protected configureRouter(router: Router): void {
        router.get('/', async (req, res, next) => {
            const { offset, limit } = req.query;

            try {
                res.status(StatusCodes.OK).json(
                    await this.eventsService.getUpcomingEvents({
                        offset: offset ? Number(offset) : undefined,
                        limit: limit ? Number(limit) : undefined,
                    }),
                );
            } catch (error) {
                next(error);
            }
        });

        router.post(
            '/',
            auth,
            validateUser,
            async (
                req: UserRequest<object, EventCreation>,
                res: Response,
                next,
            ) => {
                try {
                    res.status(StatusCodes.CREATED).json(
                        await this.eventsService.createEvent({
                            userId: req.body.session.user.userId,
                            eventName: req.body.eventName,
                            eventDescription: req.body.eventDescription,
                            eventLocation: req.body.eventLocation,
                            eventCategory: req.body.eventCategory,
                            eventPicture: req.body.eventPicture,
                            repeatPattern: req.body.repeatPattern,
                            eventDateStart: req.body.eventDateStart,
                            eventDateEnd:
                                req.body.eventDateEnd && req.body.eventDateEnd,
                        }),
                    );
                } catch (error) {
                    next(error);
                }
            },
        );
    }
}
