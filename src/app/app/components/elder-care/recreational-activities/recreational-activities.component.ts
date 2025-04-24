import { Component } from '@angular/core';
import { Routes } from '@angular/router';
@Component({
  selector: 'app-recreational-activities',
  imports: [],
  templateUrl: './recreational-activities.component.html',
  styleUrl: './recreational-activities.component.css'
})
export class RecreationalActivitiesComponent {

}
export const recreationalActivitiesRoutes: Routes = [
  {
    path: '',
    component: RecreationalActivitiesComponent
  }
];