import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './authentication/pages/login-page/login-page.component';
import {
    BUDDY_SYSTEM_EVENTS_ROUTE,
    BUDDY_SYSTEM_EVENT_ROUTE,
    CREATE_EVENT_ROUTE,
    EDIT_EVENT_ROUTE,
    EVENTS_ROUTE,
    EVENT_ROUTE,
    LOGIN_ROUTE,
    MATCHED_USER_PROFILE_ROUTE,
    MATCHED_USER_ROUTE,
    MATCHES_ROUTE,
    PASSWORD_RESET_ROUTE,
    PROFILE_EDIT_ROUTE,
    PROFILE_PREVIEW_ROUTE,
    PROFILE_ROUTE,
    REQUEST_PASSWORD_RESET_ROUTE,
    SIGNUP_ROUTE,
    SWIPING_ROUTE,
} from 'src/constants/routes';
import { SignupPageComponent } from './authentication/pages/signup-page/signup-page.component';
import { UserProfilePageComponent } from './user-profile/pages/user-profile-page/user-profile-page.component';
import { MatchesPageComponent } from './matching/pages/matches-page/matches-page.component';
import { SwipingPageComponent } from './matching/pages/swiping-page/swiping-page.component';
import { UserProfileEditPageComponent } from './user-profile/pages/user-profile-edit-page/user-profile-edit-page.component';
import { UserProfilePreviewComponent } from './user-profile/pages/user-profile-preview/user-profile-preview.component';
import { MatchedUserPageComponent } from './matching/pages/matched-user-page/matched-user-page.component';
import { RequestPasswordResetPageComponent } from './authentication/pages/request-password-reset-page/request-password-reset-page.component';
import { PasswordResetPageComponent } from './authentication/pages/password-reset-page/password-reset-page.component';
import { aboutRoutes } from './about/about-routing.module';
import { MatchedUserProfilePageComponent } from './matching/pages/matched-user-profile-page/matched-user-profile-page.component';
import { EventsPageComponent } from './events/pages/events-page/events-page.component';
import { EventPageComponent } from './events/pages/event-page/event-page.component';
import { CreateEventPageComponent } from './events/pages/create-event-page/create-event-page.component';
import { EditEventPageComponent } from './events/pages/edit-event-page/edit-event-page.component';
import { BuddySystemEventsPageComponent } from './buddy-system/pages/buddy-system-events-page/buddy-system-events-page.component';
import { BuddySystemEventPageComponent } from './buddy-system/pages/buddy-system-event-page/buddy-system-event-page.component';

const privateRoute: Route = {
    // canActivate: [privateRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const publicRoute: Route = {
    // canActivate: [publicRouteGuard],
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
};

const routes: Routes = [
    { path: SWIPING_ROUTE, component: SwipingPageComponent, ...privateRoute },
    { path: EVENTS_ROUTE, component: EventsPageComponent, ...privateRoute },
    { path: EVENT_ROUTE, component: EventPageComponent, ...privateRoute },
    {
        path: CREATE_EVENT_ROUTE,
        component: CreateEventPageComponent,
        ...privateRoute,
    },
    {
        path: EDIT_EVENT_ROUTE,
        component: EditEventPageComponent,
        ...privateRoute,
    },
    {
        path: BUDDY_SYSTEM_EVENTS_ROUTE,
        component: BuddySystemEventsPageComponent,
    },
    {
        path: BUDDY_SYSTEM_EVENT_ROUTE,
        component: BuddySystemEventPageComponent,
    },
    {
        path: PROFILE_ROUTE,
        component: UserProfilePageComponent,
        ...privateRoute,
    },
    {
        path: PROFILE_EDIT_ROUTE,
        component: UserProfileEditPageComponent,
        ...privateRoute,
    },
    {
        path: PROFILE_PREVIEW_ROUTE,
        component: UserProfilePreviewComponent,
        ...privateRoute,
    },
    { path: MATCHES_ROUTE, component: MatchesPageComponent, ...privateRoute },
    {
        path: MATCHED_USER_PROFILE_ROUTE,
        component: MatchedUserProfilePageComponent,
        ...privateRoute,
    },
    {
        path: MATCHED_USER_ROUTE,
        component: MatchedUserPageComponent,
        ...privateRoute,
    },
    { path: LOGIN_ROUTE, component: LoginPageComponent, ...publicRoute },
    { path: SIGNUP_ROUTE, component: SignupPageComponent, ...publicRoute },
    {
        path: REQUEST_PASSWORD_RESET_ROUTE,
        component: RequestPasswordResetPageComponent,
        ...publicRoute,
    },
    {
        path: PASSWORD_RESET_ROUTE,
        component: PasswordResetPageComponent,
        ...publicRoute,
    },
];

const notFoundRoutes: Routes = [
    { path: '**', redirectTo: SWIPING_ROUTE, pathMatch: 'full' },
];

const routeNames = routes.map((route) => ({
    ...route,
    path: route.path?.replace(/^\//, ''),
}));

@NgModule({
    imports: [
        RouterModule.forRoot(routeNames, {
            scrollPositionRestoration: 'top',
        }),
        RouterModule.forRoot(aboutRoutes, {
            scrollPositionRestoration: 'top',
        }),
        RouterModule.forRoot(notFoundRoutes, {
            scrollPositionRestoration: 'top',
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
