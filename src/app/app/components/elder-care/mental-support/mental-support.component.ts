import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-mental-support',
  imports: [CommonModule],
  templateUrl: './mental-support.component.html',
  styleUrl: './mental-support.component.css'
})
export class MentalSupportComponent {

}

export const mentalSupportRoutes: Routes = [
  {
    path: '',
    component: MentalSupportComponent
  }
];