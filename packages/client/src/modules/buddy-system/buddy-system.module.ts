import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuddySystemEventsPageComponent } from './pages/buddy-system-events-page/buddy-system-events-page.component';
import { UiModule } from '../ui/ui.module';
import { BuddySystemEventCardComponent } from './components/buddy-system-event-card/buddy-system-event-card.component';
import { BuddySystemEventPageComponent } from './pages/buddy-system-event-page/buddy-system-event-page.component';
import { AppRoutingModule } from '../app-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    declarations: [
        BuddySystemEventsPageComponent,
        BuddySystemEventCardComponent,
        BuddySystemEventPageComponent,
    ],
    imports: [
        CommonModule,
        UiModule,
        AppRoutingModule,
        MatSlideToggleModule,
        MatSnackBarModule,
    ],
})
export class BuddySystemModule {}
