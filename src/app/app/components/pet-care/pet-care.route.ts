import { Routes } from '@angular/router';
import { PetCareComponent } from './pet-care.component'; // Import component cha (Standalone)
import { PetProductListComponent } from './pet-product-list/pet-product-list.component'; // Import component con (Standalone)

// Export mảng Routes cho tính năng pet-care/products
export const petCareRoutes: Routes = [
  {
    // Path: '' ở đây tương ứng với path mà file này được lazy load (ví dụ: '/products')
    path: '',
    component: PetCareComponent, // Component cha sẽ được tải
    // Component cha này cần có <router-outlet> trong template của nó

    // Định nghĩa các route con, sẽ hiển thị trong <router-outlet> của component cha
    children: [
      // Route sử dụng route parameter ':category' để lấy tên danh mục
      // Ví dụ: /products/dog-food, /products/cat-food sẽ khớp với route này
      { path: ':category', component: PetProductListComponent },

      // Route mặc định khi chỉ truy cập path cha (/products)
      // Redirect đến một danh mục mặc định (ví dụ: 'dog-food')
      { path: '', redirectTo: 'dog-food', pathMatch: 'full' },

      // Tùy chọn: Thêm route cho các trang khác trong tính năng Pet Care nếu có
      // { path: 'services', component: PetServicesComponent },
      // { path: 'about', component: PetCareAboutComponent },

      // Tùy chọn: Xử lý các đường dẫn không khớp trong phạm vi của pet-care (404)
      // { path: '**', component: PetCareNotFoundComponent }
    ]
  }
];