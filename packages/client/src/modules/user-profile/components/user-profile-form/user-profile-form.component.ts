import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
    ZODIAC_SIGNS,
    DRINKING_HABITS,
    DRUGS_HABITS,
    SMOKING_HABITS,
    WORKOUT_HABITS,
    USER_TYPE,
    INTERESTS,
    ASSOCIATIONS,
} from '../../constants';
import { PROGRAMS_ARRAY } from 'common';
import { UserProfileService } from '../../services/user-profile-service/user-profile.service';
import { UserProfile } from 'common/models/user';
import { BehaviorSubject, catchError, combineLatest, debounceTime } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    arrayContainedInValidator,
    containedInValidator,
} from '../../validators/contained-in-validator';
// import { profilePictureValidator } from '../../validators/profile-picture-validator';

@Component({
    selector: 'app-user-profile-form',
    templateUrl: './user-profile-form.component.html',
    styleUrls: ['./user-profile-form.component.scss'],
})
export class UserProfileFormComponent {
    userProfileForm = new FormGroup({
        pictures: new FormControl(new Array<string | undefined>(), [
            // profilePictureValidator,
        ]),
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(255),
        ]),
        age: new FormControl(0, [
            Validators.required,
            Validators.min(0),
            Validators.max(150),
        ]),
        bio: new FormControl('', [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(255),
        ]),
        program: new FormControl('', [
            containedInValidator(
                PROGRAMS_ARRAY,
                (item, value) => item.id === value,
            ),
        ]),
        height: new FormControl(0, [Validators.min(0), Validators.max(300)]),
        interests: new FormControl<string[]>(
            [],
            [arrayContainedInValidator(INTERESTS)],
        ),
        associations: new FormControl<string[]>(
            [],
            // [arrayContainedInValidator(ASSOCIATIONS)],
        ),
        zodiacSign: new FormControl('', [
            containedInValidator(
                ZODIAC_SIGNS,
                (item, value) => item.id === value,
            ),
        ]),
        drinking: new FormControl('', [
            containedInValidator(
                DRINKING_HABITS,
                (item, value) => item.id === value,
            ),
        ]),
        usertype: new FormControl('1', [
            containedInValidator(USER_TYPE, (item, value) => item.id === value),
        ]),
        smoking: new FormControl('', [
            containedInValidator(
                SMOKING_HABITS,
                (item, value) => item.id === value,
            ),
        ]),
        drugs: new FormControl('', [
            containedInValidator(
                DRUGS_HABITS,
                (item, value) => item.id === value,
            ),
        ]),
        workout: new FormControl('', [
            containedInValidator(
                WORKOUT_HABITS,
                (item, value) => item.id === value,
            ),
        ]),
        jobTitle: new FormControl(''),
        jobCompany: new FormControl(''),
        livingIn: new FormControl(''),
        automaticallyConnect: new FormControl(false),
    });
    programs = PROGRAMS_ARRAY;
    zodiacSigns = ZODIAC_SIGNS;
    drinkingHabits = DRINKING_HABITS;
    usertype = USER_TYPE;
    smokingHabits = SMOKING_HABITS;
    drugHabits = DRUGS_HABITS;
    workoutHabits = WORKOUT_HABITS;
    interests = INTERESTS;
    associations = ASSOCIATIONS;

    pictures = [
        new BehaviorSubject<string | undefined>(undefined),
        new BehaviorSubject<string | undefined>(undefined),
        new BehaviorSubject<string | undefined>(undefined),
        new BehaviorSubject<string | undefined>(undefined),
        new BehaviorSubject<string | undefined>(undefined),
        new BehaviorSubject<string | undefined>(undefined),
    ];

    loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private readonly userProfileService: UserProfileService,
        private readonly snackBar: MatSnackBar,
    ) {
        this.userProfileService.getUserProfile().subscribe((userProfile) => {
            if (userProfile) {
                this.userProfileForm.patchValue(userProfile);

                if (userProfile.pictures) {
                    for (let i = 0; i < this.pictures.length; i++) {
                        this.pictures[i].next(userProfile.pictures[i]);
                    }
                }

                this.userProfileForm.markAsPristine();
            }
        });

        combineLatest(this.pictures)
            .pipe(debounceTime(1))
            .subscribe((pictures) => {
                this.userProfileForm.patchValue({ pictures });
            });
    }

    get userProfile() {
        return this.userProfileService.getUserProfile();
    }

    onSubmit() {
        if (this.userProfileForm.invalid) {
            return;
        }

        const res: Omit<Partial<UserProfile>, 'userId'> = {};

        for (const [k, v] of Object.entries(this.userProfileForm.value)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (res as any)[k] = v ?? undefined;
        }

        this.loading$.next(true);
        this.userProfileForm.markAsPending();
        this.userProfileService.updateUserProfile(res);
        this.userProfileService
            .applyUserProfileChanges()
            .pipe(
                catchError((err) => {
                    this.snackBar.open(
                        'Erreur lors de la mise à jour du profil',
                        undefined,
                        {
                            duration: 2000,
                            politeness: 'assertive',
                            verticalPosition: 'top',
                        },
                    );
                    this.loading$.next(false);
                    return err;
                }),
            )
            .subscribe(() => {
                this.snackBar.open('Profil mis à jour', undefined, {
                    duration: 2000,
                    politeness: 'polite',
                    verticalPosition: 'top',
                });
                this.loading$.next(false);
            });
    }

    markDirty() {
        this.userProfileForm.markAsDirty();
    }
}
