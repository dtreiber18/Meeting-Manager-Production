import { Routes } from '@angular/router';

import { HomeContainerComponent } from './home-container/home-container.component';
import { MeetingListComponent } from './meetings/meeting-list/meeting-list.component';
import { MeetingDetailsScreenComponent } from './meetings/meeting-details-screen.component';
import { MeetingFormComponent } from './meetings/meeting-form/meeting-form.component';
import { PreviousMeetingsComponent } from './meetings/previous-meetings/previous-meetings.component';
import { SimpleSettingsComponent } from './simple-settings/simple-settings.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { AuthComponent } from './auth/auth.component';
import { AuthTestComponent } from './testing/auth-test.component';
import { CalendarAuthComponent } from './calendar-auth/calendar-auth.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { ActionItemListComponent } from './action-items/action-item-list.component';
import { ActionItemDetailsComponent } from './action-items/action-item-details.component';
import { HelpComponent } from './help/help.component';
import { HelpAdminComponent } from './help-admin/help-admin.component';
import { AuthGuard, GuestGuard } from './auth/auth.guard';

export const routes: Routes = [
	{ path: 'auth', component: AuthComponent, canActivate: [GuestGuard] },
	{ path: 'auth/callback', component: AuthCallbackComponent },
	{ path: 'auth-test', component: AuthTestComponent }, // No guard for testing
	{ path: 'calendar-setup', component: CalendarAuthComponent, canActivate: [AuthGuard] },
	{ path: '', component: HomeContainerComponent, canActivate: [AuthGuard] },
	{ path: 'dashboard', redirectTo: '', pathMatch: 'full' },
	{ path: 'meetings', component: MeetingListComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/previous', component: PreviousMeetingsComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/new', component: MeetingFormComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/:id', component: MeetingDetailsScreenComponent, canActivate: [AuthGuard] },
	{ path: 'meetings/:id/edit', component: MeetingFormComponent, canActivate: [AuthGuard] },
	
	// Action Items
	{ path: 'action-items', component: ActionItemListComponent, canActivate: [AuthGuard] },
	{ path: 'action-items/:id', component: ActionItemDetailsComponent, canActivate: [AuthGuard] },
	
	// Help Center
	{ path: 'help', component: HelpComponent, canActivate: [AuthGuard] },
	{ path: 'help/admin', component: HelpAdminComponent, canActivate: [AuthGuard] },
	
	// User Preferences (dedicated pages)
	{ path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
	{ path: 'preferences', loadComponent: () => import('./preferences/preferences-only.component').then(m => m.PreferencesComponent), canActivate: [AuthGuard] },
	{ path: 'calendar-settings', loadComponent: () => import('./calendar-settings/calendar-settings.component').then(m => m.CalendarSettingsComponent), canActivate: [AuthGuard] },
	
	// Legacy tabbed interface (keep for power users who prefer consolidated settings)
	{ path: 'settings/preferences', component: PreferencesComponent, canActivate: [AuthGuard] },
	{ path: 'settings/preferences/calendar', component: PreferencesComponent, canActivate: [AuthGuard] },
	
	// System Admin Settings (only accessible by System Admins)
	{ path: 'settings', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	{ path: 'settings/system', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	{ path: 'settings/organization', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	{ path: 'settings/users', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	{ path: 'settings/monitoring', component: SimpleSettingsComponent, canActivate: [AuthGuard] },
	
	{ path: 'unauthorized', redirectTo: '/auth', pathMatch: 'full' },
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];
