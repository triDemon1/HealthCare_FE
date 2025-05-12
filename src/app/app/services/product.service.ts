import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.interface'; // Import interface
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../models/pagination.interface';
import { Category } from '../models/categoryDto.interface';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hoặc 'providedIn: ProductsModule' nếu bạn muốn service chỉ có trong module này
})
export class ProductService {
  private apiUrl = `https://localhost:7064/api/products`; // Sử dụng biến môi trường
  private apiUrlLookUpData = 'https://localhost:7064/api/LookUpData';

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
  createProductWithFile(formData: FormData): Observable<Product> {
    // HttpClient sẽ tự động đặt Content-Type là multipart/form-data khi gửi FormData
    return this.http.post<Product>(this.apiUrl, formData);
  }

  /**
   * Cập nhật sản phẩm với tệp hình ảnh (hoặc không có tệp mới).
   * @param productId ID của sản phẩm cần cập nhật.
   * @param formData FormData chứa dữ liệu sản phẩm và tệp hình ảnh (nếu có).
   * @returns Observable của đối tượng Product sau khi cập nhật.
   */
  updateProductWithFile(productId: number, formData: FormData): Observable<Product> {
    // HttpClient sẽ tự động đặt Content-Type là multipart/form-data khi gửi FormData
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, formData);
  }
  /**
   * Tạo sản phẩm mới.
   * @param product Sản phẩm cần tạo (dạng Product interface).
   * @returns Observable của đối tượng Product đã được tạo (bao gồm ID).
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Cập nhật sản phẩm.
   * @param productId ID của sản phẩm cần cập nhật.
   * @param product Sản phẩm đã cập nhật (dạng Product interface).
   * @returns Observable của đối tượng Product sau khi cập nhật.
   */
  updateProduct(productId: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, product);
  }

  /**
   * Xóa sản phẩm theo ID.
   * @param productId ID của sản phẩm cần xóa.
   * @returns Observable<void> (không trả về nội dung).
   */
  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrlLookUpData}/categories`)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: any) {
    console.error('API Error:', error);
    // Trả về một thông báo lỗi thân thiện với người dùng hoặc throwError
    return throwError(() => new Error('Đã xảy ra lỗi khi gọi API. Vui lòng thử lại.'));
  }
}