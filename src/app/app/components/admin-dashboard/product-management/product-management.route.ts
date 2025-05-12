import { Routes } from '@angular/router';
import { ProductManagementComponent } from './product-management.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
export const productManagementRoutes: Routes = [
    {
        path: '',
        component: ProductManagementComponent
    }
];
export const productEditRoutes: Routes = [
    {
        path: '',
        component: ProductDetailComponent
    }
];