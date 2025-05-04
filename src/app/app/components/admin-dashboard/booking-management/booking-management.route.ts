import { Routes } from '@angular/router';
import { BookingManagementComponent } from './booking-management.component';
import { BookingEditComponent } from './booking-edit/booking-edit.component';
export const bookingManagementRoutes: Routes = [
    {
        path: '',
        component: BookingManagementComponent
    }
];
export const bookingEditRoutes: Routes = [
    {
        path: '',
        component: BookingEditComponent
    }
];
