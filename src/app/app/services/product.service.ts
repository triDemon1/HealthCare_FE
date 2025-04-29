import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.interface'; // Import interface

@Injectable({
  providedIn: 'root' // Hoặc 'providedIn: ProductsModule' nếu bạn muốn service chỉ có trong module này
})
export class ProductService {
  private dummyProducts: Product[] = [
    { id: 1, name: 'Hạt Doggo Pro', category: 'dog-food', price: 250000, imageUrl: 'assets/images/dong_vat/1.jpg' }, // <-- Thêm id và imageUrl
  { id: 2, name: 'Pate Miu Miu', category: 'cat-food', price: 80000, imageUrl: 'assets/images/dong_vat/2.jpg' },
  { id: 3, name: 'Vòng cổ da', category: 'equipment', price: 150000, imageUrl: 'assets/images/dong_vat/3.jpg' },
  { id: 4, name: 'Bóng đồ chơi', category: 'toys', price: 50000, imageUrl: 'assets/images/dong_vat/4.jpg' },
  { id: 5, name: 'Hạt Doggo Max', category: 'dog-food', price: 350000, imageUrl: 'assets/images/dong_vat/5.jpg' },
    // ... thêm sản phẩm khác
  ];

  constructor() { }

  getProductsByCategory(category: string): Observable<Product[]> {
    // Giả lập gọi API hoặc lấy dữ liệu từ nguồn
    const filteredProducts = this.dummyProducts.filter(p => p.category === category);
    return of(filteredProducts); // Sử dụng 'of' để trả về Observable từ dữ liệu giả lập
  }

  // getProductDetail(id: number): Observable<Product | undefined> { ... }
}