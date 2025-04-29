import { Routes } from '@angular/router';
import { PetProductListComponent } from './pet-product-list.component';

export const petProductList: Routes = [
    // Route cho các danh mục cụ thể sử dụng route parameter
  // Path ':category' sẽ match bất kỳ segment nào ở vị trí này,
  // ví dụ: 'dog-food', 'cat-food', 'equipment', 'toys'
  { path: ':category', component: PetProductListComponent },

  // Route cho path gốc của /products (tức là khi chỉ truy cập /products)
  // Ta sẽ redirect về một danh mục mặc định, ví dụ dog-food
  { path: '', redirectTo: 'dog-food', pathMatch: 'full' },

  // Tùy chọn: Route xử lý các đường dẫn không khớp nào ở trên trong phạm vi /products
  // { path: '**', component: NotFoundInProductsComponent } // Cần tạo component này
];