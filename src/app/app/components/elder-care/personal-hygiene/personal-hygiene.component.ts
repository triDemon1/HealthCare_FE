import { Component } from '@angular/core';
import { Routes } from '@angular/router';
@Component({
  selector: 'app-personal-hygiene',
  imports: [],
  templateUrl: './personal-hygiene.component.html',
  styleUrl: './personal-hygiene.component.css'
})
export class PersonalHygieneComponent {

}
export const personalHygieneRoutes: Routes = [
  {
    path: '',
    component: PersonalHygieneComponent
  }
];