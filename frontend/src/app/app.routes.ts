import { Routes } from '@angular/router';


import { HomeContainerComponent } from './home-container/home-container.component';
import { MeetingListComponent } from './meetings/meeting-list/meeting-list.component';
import { MeetingDetailsComponent } from './meetings/meeting-details/meeting-details.component';
import { MeetingFormComponent } from './meetings/meeting-form/meeting-form.component';

export const routes: Routes = [
	{ path: '', component: HomeContainerComponent },
	{ path: 'meetings', component: MeetingListComponent },
	{ path: 'meetings/new', component: MeetingFormComponent },
	{ path: 'meetings/:id', component: MeetingDetailsComponent },
	{ path: 'meetings/:id/edit', component: MeetingFormComponent },
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];
