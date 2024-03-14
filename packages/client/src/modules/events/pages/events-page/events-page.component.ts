import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { Observable } from 'rxjs';
import { EventExtended } from 'common/models/events';
import { ValidationService } from 'src/modules/validation/services/validation.service';

@Component({
    selector: 'app-events-page',
    templateUrl: './events-page.component.html',
    styleUrls: ['./events-page.component.scss'],
})
export class EventsPageComponent implements OnInit {
    upcomingEvents: Observable<EventExtended[]>;
    loaded: Observable<boolean>;

    constructor(
        private readonly eventsService: EventsService,
        private readonly validationService: ValidationService,
    ) {
        this.upcomingEvents = this.eventsService.upcomingEvents;
        this.loaded = this.eventsService.loaded;
    }

    ngOnInit(): void {
        this.validationService.userValid.subscribe((userValid) => {
            if (userValid) {
                this.eventsService.fetchUpcomingEvents();
            }
        });
    }
}
