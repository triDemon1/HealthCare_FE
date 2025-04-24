import { Component } from '@angular/core';
import { Routes } from '@angular/router';
@Component({
  selector: 'app-bathing',
  imports: [],
  templateUrl: './bathing.component.html',
  styleUrl: './bathing.component.css'
})
export class BathingComponent {

}
export const bathingRoutes: Routes = [
  {
    path: '',
    component: BathingComponent
  }
];
