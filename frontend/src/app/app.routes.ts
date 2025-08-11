import { Routes } from '@angular/router';

import { HomeContainerComponent } from './home-container/home-container.component';
import { MeetingListComponent } from './meetings/meeting-list/meeting-list.component';
import { MeetingDetailsComponent } from './meetings/meeting-details/meeting-details.component';
import { MeetingFormComponent } from './meetings/meeting-form/meeting-form.component';
import { PreviousMeetingsComponent } from './meetings/previous-meetings/previous-meetings.component';
import { SimpleSettingsComponent } from './simple-settings/simple-settings.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard, GuestGuard } from './auth/auth.guard';

export const routes: Routes = [
	{ path: 'auth', component: AuthComponent, canActivate: [GuestGuard] },
	{ path: '', component: HomeContainerComponent, canActivate: [AuthGuard] },
	{ path: 'dashboard', redirectTo: '', pathMatch: 'full' },
	{ path: 'meetings', component: MeetingListComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/previous', component: PreviousMeetingsComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/new', component: MeetingFormComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/:id', component: MeetingDetailsComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/:id/edit', component: MeetingFormComponent, canActivate: [AuthGuard] },
	{ path: 'settings', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	{ path: 'unauthorized', redirectTo: '/auth', pathMatch: 'full' },
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];
