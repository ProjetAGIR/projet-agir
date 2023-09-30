import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchesPageComponent } from './pages/matches-page/matches-page.component';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { SwipingPageComponent } from './pages/swiping-page/swiping-page.component';
import { UiModule } from '../ui/ui.module';
import { MatchListComponent } from './components/match-list/match-list.component';
import { AppRoutingModule } from '../app-routing.module';
import { MatchedUserPageComponent } from './pages/matched-user-page/matched-user-page.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [MatchesPageComponent, SwipingPageComponent, MatchListComponent, MatchedUserPageComponent],
    imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, UserProfileModule, UiModule],
    exports: [MatchesPageComponent, MatchedUserPageComponent],
})
export class MatchingModule {}
