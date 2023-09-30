import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileFormComponent } from './components/user-profile-form/user-profile-form.component';
import { UserProfileCardComponent } from './components/user-profile-card/user-profile-card.component';
import { ImageModule } from '../image/image.module';
import { MatMenuModule } from '@angular/material/menu';
import { UserProfileEditPageComponent } from './pages/user-profile-edit-page/user-profile-edit-page.component';
import { AppRoutingModule } from '../app-routing.module';
import { UiModule } from '../ui/ui.module';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    declarations: [
        UserProfilePageComponent,
        UserProfileFormComponent,
        UserProfileCardComponent,
        UserProfileEditPageComponent,
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        ReactiveFormsModule,
        UiModule,
        ImageModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
    ],
    exports: [
        UserProfilePageComponent,
        UserProfileEditPageComponent,
        UserProfileCardComponent,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' },
        },
    ],
})
export class UserProfileModule {}
