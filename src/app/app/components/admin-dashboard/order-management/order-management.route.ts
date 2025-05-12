import { Routes } from '@angular/router';
import { OrderManagementComponent } from './order-management.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
export const orderManagementRoutes: Routes = [
    {
        path: '',
        component: OrderManagementComponent
    }
];
export const orderEditRoutes: Routes = [
    {
        path: '',
        component: OrderDetailComponent
    }
];