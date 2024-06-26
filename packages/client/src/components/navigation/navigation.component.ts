import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import {
    NAVIGATION,
    NAVIGATION_NOT_LOGGED_IN,
    NavigationItem,
} from 'src/constants/navigation';
import { AuthenticationService } from 'src/modules/authentication/services/authentication-service/authentication.service';
import { SessionService } from 'src/modules/authentication/services/session-service/session.service';
import { PublicProfileService } from 'src/modules/matching/services/public-profile-service/public-profile.service';
import { UserProfileService } from 'src/modules/user-profile/services/user-profile-service/user-profile.service';
import { ValidationService } from 'src/modules/validation/services/validation.service';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly sessionService: SessionService,
        private readonly userProfileService: UserProfileService,
        private readonly router: Router,
        private readonly publicProfileService: PublicProfileService,
        private readonly validationService: ValidationService,
    ) {}

    get navigation(): Observable<NavigationItem[]> {
        return this.isLoggedIn.pipe(
            map((isLoggedIn) =>
                isLoggedIn ? NAVIGATION : NAVIGATION_NOT_LOGGED_IN,
            ),
        );
    }

    get isLoggedIn() {
        return this.sessionService.isLoggedIn();
    }

    get user() {
        return this.sessionService.session.pipe(
            map((session) => session?.user),
        );
    }

    get userProfile() {
        return this.userProfileService.getUserProfile();
    }

    get name() {
        return combineLatest([this.user, this.userProfile]).pipe(
            map(([user, userProfile]) => {
                return userProfile?.name ?? user?.email ?? '';
            }),
        );
    }

    get avatar() {
        return this.userProfile.pipe(
            map((userProfile) => {
                const avatar = userProfile?.pictures?.[0] ?? undefined;

                return avatar
                    ? `${avatar}-/scale_crop/100x100/smart/`
                    : undefined;
            }),
        );
    }

    get unreadConversationCount() {
        return this.publicProfileService.unreadConversationCount;
    }

    get userValidActionsCount() {
        return this.validationService.userValidActionsCount.pipe(
            map((count) => count ?? 0),
        );
    }

    logout() {
        this.authenticationService.logout().subscribe();
    }

    isActiveLink(href: string) {
        return this.router.url === href;
    }
}
