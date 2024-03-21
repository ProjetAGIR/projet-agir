import { Component } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Observable,
    combineLatest,
    firstValueFrom,
    map,
    of,
    switchMap,
} from 'rxjs';
import { EventCreation, EventExtended } from 'common/models/events';
import { ValidationService } from 'src/modules/validation/services/validation.service';
import { SessionService } from 'src/modules/authentication/services/session-service/session.service';
import { EVENTS_ROUTE } from 'src/constants/routes';

@Component({
    selector: 'app-edit-event-page',
    templateUrl: './edit-event-page.component.html',
    styleUrls: ['./edit-event-page.component.scss'],
})
export class EditEventPageComponent {
    event$: Observable<EventExtended | undefined>;

    constructor(
        private readonly eventsService: EventsService,
        private readonly sessionService: SessionService,
        private readonly validationService: ValidationService,
        private readonly activeRoute: ActivatedRoute,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
    ) {
        this.event$ = combineLatest([
            this.sessionService.session,
            this.validationService.userValid,
            this.activeRoute.paramMap,
        ]).pipe(
            switchMap(([session, userValid, params]) => {
                const eventId = params.get('eventId');

                if (userValid && eventId) {
                    return this.eventsService
                        .getEvent(Number(eventId))
                        .pipe(
                            map((event) =>
                                event?.userId !== session?.user.userId
                                    ? undefined
                                    : event,
                            ),
                        );
                }

                return of(undefined);
            }),
        );
    }

    async handleSubmit(editedEvent: Omit<EventCreation, 'userId'>) {
        const event = await firstValueFrom(this.event$);

        if (!event) return;

        this.eventsService.updateEvent(event.eventId, editedEvent).subscribe({
            next: (event) => {
                this.snackBar.open('Événement modifié', 'OK', {
                    duration: 3000,
                });
                this.router.navigate(['/events', event?.eventId]);
            },
            error: (err) => {
                // eslint-disable-next-line no-console
                console.error(err);
                this.snackBar.open('Un erreur est survenu', 'OK', {
                    duration: 3000,
                });
            },
        });
    }

    async handleDelete() {
        const event = await firstValueFrom(this.event$);

        if (!event) return;

        if (confirm(`Supprimer "${event.eventName}" ?`)) {
            this.eventsService.deleteEvent(event.eventId).subscribe({
                next: () => {
                    this.snackBar.open('Événement supprimé', 'OK', {
                        duration: 3000,
                    });
                    this.router.navigate([EVENTS_ROUTE], { replaceUrl: true });
                },
                error: (err) => {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    this.snackBar.open('Un erreur est survenu', 'OK', {
                        duration: 3000,
                    });
                },
            });
        }
    }
}
