import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { HomeComponent } from './app/components/home/home.component';
import { RegisterComponent } from './app/components/register/register.component';
import { BookingComponent } from './app/components/booking/booking.component';
import { AdminDashboardComponent } from './app/components/admin-dashboard/admin-dashboard.component';
import { RequestApprovalComponent } from './app/components/request-approval/request-approval.component';
import { ReportsComponent } from './app/components/reports/reports.component';
import { AppointmentListComponent } from './app/components/appointment-list/appointment-list.component';
import { ElderCareComponent } from './app/components/elder-care/elder-care.component';
import { ChildCareComponent } from './app/components/child-care/child-care.component';
import { PetCareComponent } from './app/components/pet-care/pet-care.component';
import { CartComponent } from './app/components/cart/cart.component';
import { ProductComponent } from './app/components/product/product.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'booking', component: BookingComponent},
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/requests', component: RequestApprovalComponent },
  { path: 'admin/reports', component: ReportsComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'elder-care', component: ElderCareComponent },
  { path: 'child-care', component: ChildCareComponent },
  { path: 'pet-care', component: PetCareComponent },
  { path: 'cart', component: CartComponent },
  { path: 'products', component: ProductComponent },
  { path: 'products/:categoryId', component: ProductComponent },
  {
    path: 'elder-care/medical-care',
    loadChildren: () =>
      import('./app/components/elder-care/medical-care/medical-care.component').then(m => m.medicalCareRoutes)
  },
  {
    path: 'elder-care/basic-care/meal-support',
    loadChildren: () =>
      import('./app/components/elder-care/meal-support/meal-support.component').then(m => m.mealSupportRoutes)
  },
  {
    path: 'elder-care/mental-support',
    loadChildren: () =>
      import('./app/components/elder-care/mental-support/mental-support.component').then(m => m.mentalSupportRoutes)
  },
  {
    path: 'elder-care/excercises',
    loadChildren: () =>
      import('./app/components/elder-care/excercise/excercise.component').then(m => m.excerciseRoutes)
  },
  {
    path: 'elder-care/periodic-checkup',
    loadChildren: () =>
      import('./app/components/elder-care/periodic-checkup/periodic-checkup.component').then(m => m.periodicCheckUpRoutes)
  },
  {
    path: 'elder-care/bathing',
    loadChildren: () =>
      import('./app/components/elder-care/bathing/bathing.component').then(m => m.bathingRoutes)
  },
  {
    path: 'elder-care/personal-hygiene',
    loadChildren: () =>
      import('./app/components/elder-care/personal-hygiene/personal-hygiene.component').then(m => m.personalHygieneRoutes)
  },
  {
    path: 'elder-care/recreational-activities',
    loadChildren: () =>
      import('./app/components/elder-care/recreational-activities/recreational-activities.component').then(m => m.recreationalActivitiesRoutes)
  },
  {
    path: 'elder-care/chat',
    loadChildren: () =>
      import('./app/components/elder-care/chat/chat.component').then(m => m.chatRoutes)
  },
  {
    path: 'elder-care/basic-care',
    loadChildren: () =>
      import('./app/components/elder-care/basic-care/basic-care.routes').then(m => m.basicCareRoutes)
  },
  {
    path: 'admin/users',
    loadChildren: () =>
      import('./app/components/admin-dashboard/user-management/user-management.route').then(m => m.userManagementRoutes)
  },
  {
    path: 'admin/users/:roleId', // Route for admin/users/:roleId
    loadChildren: () => import('./app/components/admin-dashboard/user-management/user-management.route').then(m => m.userManagementRoutes)
  },
  {
    path: 'admin/users/create',
    loadChildren: () =>
      import('./app/components/admin-dashboard/user-management/user-management.route').then(m => m.userEditRoutes)
  },
  {
    path: 'admin/users/edit/:id',
    loadChildren: () =>
      import('./app/components/admin-dashboard/user-management/user-management.route').then(m => m.userEditRoutes)
  },
  {
    path: 'admin/bookings',
    loadChildren: () =>
      import('./app/components/admin-dashboard/booking-management/booking-management.route').then(m => m.bookingManagementRoutes)
  },
  {
    path: 'admin/bookings/edit/:id',
    loadChildren: () =>
      import('./app/components/admin-dashboard/booking-management/booking-management.route').then(m => m.bookingEditRoutes)
  },
  {
    path: 'admin/services',
    loadChildren: () =>
      import('./app/components/admin-dashboard/service-management/service-management.route').then(m => m.serviceManagementRoutes)
  },
];

export default routes;
