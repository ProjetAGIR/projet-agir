import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventCreation } from 'common/models/events';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-event-form',
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent {
    @Input() initialValue: Partial<EventCreation> = {};
    @Output() submit = new EventEmitter<Omit<EventCreation, 'userId'>>();

    newEventForm = new FormGroup({
        eventName: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        eventDescription: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        eventLocation: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        eventCategory: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        eventPicture: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        eventDateStart: new FormControl('', [Validators.required]),
        eventHourStart: new FormControl<number>(0, [
            Validators.required,
            Validators.min(0),
            Validators.max(23),
        ]),
        eventMinuteStart: new FormControl<number>(0, [
            Validators.required,
            Validators.min(0),
            Validators.max(59),
        ]),
        eventDateEnd: new FormControl('', []),
        eventHourEnd: new FormControl<number>(0, [
            Validators.min(0),
            Validators.max(23),
        ]),
        eventMinuteEnd: new FormControl<number>(0, [
            Validators.min(0),
            Validators.max(59),
        ]),
    });
    picture = new BehaviorSubject<string | undefined>(undefined);

    constructor() {
        this.picture.subscribe((picture) => {
            this.newEventForm.patchValue({ eventPicture: picture });
        });
    }

    handleSubmit() {
        if (this.newEventForm.invalid) {
            throw new Error('Form is invalid');
        }

        const startDate = new Date(
            this.newEventForm.value.eventDateStart ?? 'Not a date',
        );

        startDate.setHours(this.newEventForm.value.eventHourStart ?? 0);
        startDate.setMinutes(this.newEventForm.value.eventMinuteStart ?? 0);

        const endDate = new Date(
            this.newEventForm.value.eventDateEnd ??
                this.newEventForm.value.eventDateStart ??
                'Not a date',
        );

        endDate.setHours(
            this.newEventForm.value.eventHourEnd ??
                this.newEventForm.value.eventHourStart ??
                0,
        );
        endDate.setMinutes(
            this.newEventForm.value.eventMinuteEnd ??
                this.newEventForm.value.eventMinuteStart ??
                0,
        );

        const newEvent: Omit<EventCreation, 'userId'> = {
            eventName: this.newEventForm.value.eventName ?? '',
            eventDescription: this.newEventForm.value.eventDescription ?? '',
            eventLocation: this.newEventForm.value.eventLocation ?? '',
            eventCategory: this.newEventForm.value.eventCategory ?? '',
            eventPicture: this.newEventForm.value.eventPicture ?? '',
            eventDateStart: startDate,
            eventDateEnd: endDate,
            repeatPattern: 'none',
        };

        this.submit.emit(newEvent);
    }
}
