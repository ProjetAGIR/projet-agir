import { Component } from '@angular/core';
import { catchError, of } from 'rxjs';
import { EventsService } from '../../services/events.service';
import { EventCreation } from 'common/models/events';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-event-page',
    templateUrl: './create-event-page.component.html',
    styleUrls: ['./create-event-page.component.scss'],
})
export class CreateEventPageComponent {
    constructor(
        private readonly eventsService: EventsService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
    ) {}

    handleSubmit(newEvent: Omit<EventCreation, 'userId'>) {
        this.eventsService
            .createEvent(newEvent)
            .pipe(
                catchError((err) => {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    this.snackBar.open('Un erreur est survenu', 'OK', {
                        duration: 3000,
                    });
                    return of(undefined);
                }),
            )
            .subscribe((event) => {
                this.snackBar.open('Événement créé', 'OK', {
                    duration: 3000,
                });
                this.router.navigate(['/events', event?.eventId]);
            });
    }
}
