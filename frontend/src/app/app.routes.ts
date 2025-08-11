import { Routes } from '@angular/router';

import { HomeContainerComponent } from './home-container/home-container.component';
import { MeetingListComponent } from './meetings/meeting-list/meeting-list.component';
import { MeetingDetailsComponent } from './meetings/meeting-details/meeting-details.component';
import { MeetingFormComponent } from './meetings/meeting-form/meeting-form.component';
import { PreviousMeetingsComponent } from './meetings/previous-meetings/previous-meetings.component';
import { SimpleSettingsComponent } from './simple-settings/simple-settings.component';

export const routes: Routes = [
	{ path: '', component: HomeContainerComponent },
	{ path: 'meetings', component: MeetingListComponent },
	{ path: 'meetings/previous', component: PreviousMeetingsComponent },
	{ path: 'meetings/new', component: MeetingFormComponent },
	{ path: 'meetings/:id', component: MeetingDetailsComponent },
	{ path: 'meetings/:id/edit', component: MeetingFormComponent },
	{ path: 'settings', component: SimpleSettingsComponent },
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];
