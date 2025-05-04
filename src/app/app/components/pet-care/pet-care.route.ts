import { Routes } from '@angular/router';
import { PetCareComponent } from './pet-care.component'; // Import component cha (Standalone)

// Export mảng Routes cho tính năng pet-care/products
export const petCareRoutes: Routes = [
  {
    // Path: '' ở đây tương ứng với path mà file này được lazy load (ví dụ: '/products')
    path: '',
    component: PetCareComponent,
  }
];