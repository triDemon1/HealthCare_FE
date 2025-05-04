import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.interface'; // Import interface
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../models/pagination.interface';

@Injectable({
  providedIn: 'root' // Hoặc 'providedIn: ProductsModule' nếu bạn muốn service chỉ có trong module này
})
export class ProductService {
  private apiUrl = `https://localhost:7064/api/products`; // Sử dụng biến môi trường

  constructor(private http: HttpClient) { }

  // Lấy sản phẩm theo CategoryID (hoặc tên category nếu API hỗ trợ)
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    // Điều chỉnh URL API theo cách backend của bạn xử lý filtering
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  // Lấy chi tiết một sản phẩm (nếu cần)
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }
  getPagedProducts(pageIndex: number, pageSize: number, categoryId: number | null = null): Observable<Pagination<Product>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString()) // Chuyển số sang string cho HttpParams
      .set('pageSize', pageSize.toString());

    if (categoryId !== null) {
      params = params.set('categoryId', categoryId.toString());
    }

    // Gửi yêu cầu GET với các tham số query
    return this.http.get<Pagination<Product>>(this.apiUrl, { params });
  }
}