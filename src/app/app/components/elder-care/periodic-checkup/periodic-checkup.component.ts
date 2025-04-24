import { Component } from '@angular/core';
import { Routes } from '@angular/router';
@Component({
  selector: 'app-periodic-checkup',
  imports: [],
  templateUrl: './periodic-checkup.component.html',
  styleUrl: './periodic-checkup.component.css'
})
export class PeriodicCheckupComponent {

}
export const periodicCheckUpRoutes: Routes = [
  {
    path: '',
    component: PeriodicCheckupComponent
  }
];
