import { Routes } from '@angular/router';
import { UserManagementComponent } from './user-management.component';
import { UserCreateUpdateComponent } from './user-create-update/user-create-update.component';
export const userManagementRoutes: Routes = [
    {
        path: '',
        component: UserManagementComponent
    }
];
export const userEditRoutes: Routes = [
    {
        path: '',
        component: UserCreateUpdateComponent
    }
];