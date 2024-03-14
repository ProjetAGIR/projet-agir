import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-create-event-page',
    templateUrl: './create-event-page.component.html',
    styleUrls: ['./create-event-page.component.scss'],
})
export class CreateEventPageComponent {
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
}
