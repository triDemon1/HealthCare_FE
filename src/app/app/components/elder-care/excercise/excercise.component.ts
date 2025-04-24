import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-excercise',
  imports: [],
  templateUrl: './excercise.component.html',
  styleUrl: './excercise.component.css'
})
export class ExcerciseComponent {
  constructor( private router: Router) {}
  goToBooking() {
    this.router.navigate(['/booking']); // <-- Sử dụng router.navigate
  }
}
// cau hinh route
export const excerciseRoutes: Routes = [
  {
    path: '',
    component: ExcerciseComponent
  }
];