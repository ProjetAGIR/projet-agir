import { Response, Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { EventsService } from '../../services/events-service/events-service';
import { auth } from '../../middlewares/auth';
import { validateUser } from '../../middlewares/validate-user';
import { UserRequest } from '../../types/requests';
import { EventCreation, EventResponse } from 'common/models/events';

@singleton()
export class EventsController extends AbstractController {
    constructor(private readonly eventsService: EventsService) {
        super('/events');
    }

    protected configureRouter(router: Router): void {
        router.get(
            '/',
            auth,
            validateUser,
            async (req: UserRequest, res: Response, next) => {
                const { offset, limit } = req.query;

                try {
                    res.status(StatusCodes.OK).json(
                        await this.eventsService.getUpcomingEvents(
                            req.body.session.user.userId,
                            {
                                offset: offset ? Number(offset) : undefined,
                                limit: limit ? Number(limit) : undefined,
                            },
                        ),
                    );
                } catch (error) {
                    next(error);
                }
            },
        );

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

        router.patch(
            '/:eventId',
            auth,
            validateUser,
            async (
                req: UserRequest<{ eventId: number }, EventCreation>,
                res: Response,
                next,
            ) => {
                try {
                    res.status(StatusCodes.OK).json(
                        await this.eventsService.updateEvent(
                            req.body.session.user.userId,
                            Number(req.params.eventId),
                            {
                                eventName: req.body.eventName,
                                eventDescription: req.body.eventDescription,
                                eventLocation: req.body.eventLocation,
                                eventCategory: req.body.eventCategory,
                                eventPicture: req.body.eventPicture,
                                repeatPattern: req.body.repeatPattern,
                                eventDateStart: req.body.eventDateStart,
                                eventDateEnd:
                                    req.body.eventDateEnd &&
                                    req.body.eventDateEnd,
                                userId: req.body.userId,
                            },
                        ),
                    );
                } catch (error) {
                    next(error);
                }
            },
        );

        router.delete(
            '/:eventId',
            auth,
            validateUser,
            async (
                req: UserRequest<{ eventId: number }>,
                res: Response,
                next,
            ) => {
                try {
                    await this.eventsService.deleteEvent(
                        req.body.session.user.userId,
                        Number(req.params.eventId),
                    );
                    res.sendStatus(StatusCodes.NO_CONTENT);
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/:eventId/response',
            auth,
            validateUser,
            async (
                req: UserRequest<
                    { eventId: number },
                    { response: EventResponse }
                >,
                res: Response,
                next,
            ) => {
                try {
                    res.status(StatusCodes.OK).json(
                        await this.eventsService.respondToEvent(
                            req.body.session.user.userId,
                            Number(req.params.eventId),
                            req.body.response,
                        ),
                    );
                } catch (error) {
                    next(error);
                }
            },
        );
    }
}
