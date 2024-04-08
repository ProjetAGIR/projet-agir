import { Component, Input } from '@angular/core';
import { BuddySystemEventExtended } from 'common/models/buddy-system';
import { toRelativeDateString } from 'src/modules/matching/utils/date';

@Component({
    selector: 'app-buddy-system-event-card',
    templateUrl: './buddy-system-event-card.component.html',
    styleUrls: ['./buddy-system-event-card.component.scss'],
})
export class BuddySystemEventCardComponent {
    @Input() event!: BuddySystemEventExtended;
    descriptionMaxLength = 60;

    getDescription(): string {
        if (this.event.description.length <= this.descriptionMaxLength) {
            return this.event.description;
        }
        return (
            this.event.description.substring(0, this.descriptionMaxLength - 3) +
            '...'
        );
    }

    getFormattedDate(date: Date) {
        return toRelativeDateString(
            date,
            {
                alwaysRelative: true,
                allowPast: false,
            },
            { past: 'Fini' },
        );
    }

    isCompleted() {
        return this.event.eventDate < new Date();
    }
}
