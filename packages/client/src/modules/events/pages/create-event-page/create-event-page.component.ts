import { Component } from '@angular/core';
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
        this.eventsService.createEvent(newEvent).subscribe({
            next: (event) => {
                this.snackBar.open('Événement créé', 'OK', {
                    duration: 3000,
                });
                this.router.navigate(['/events', event?.eventId]);
            },
            error: (error) => {
                // eslint-disable-next-line no-console
                console.error(error);
                this.snackBar.open('Une erreur est survenue', 'OK', {
                    duration: 3000,
                });
            },
        });
    }
}
