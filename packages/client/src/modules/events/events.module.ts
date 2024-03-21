import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsPageComponent } from './pages/events-page/events-page.component';
import { UiModule } from '../ui/ui.module';
import { EventCardComponent } from './components/event-card/event-card.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from '../app-routing.module';
import { EventPageComponent } from './pages/event-page/event-page.component';
import { CreateEventPageComponent } from './pages/create-event-page/create-event-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageModule } from '../image/image.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EditEventPageComponent } from './pages/edit-event-page/edit-event-page.component';

@NgModule({
    declarations: [
        EventsPageComponent,
        EventCardComponent,
        EventPageComponent,
        CreateEventPageComponent,
        EventFormComponent,
        EditEventPageComponent,
    ],
    imports: [
        CommonModule,
        UiModule,
        MatMenuModule,
        MatRadioModule,
        MatSnackBarModule,
        AppRoutingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        ImageModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
})
export class EventsModule {}
