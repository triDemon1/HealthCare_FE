// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../models/CartItem.interface';
import { Product } from '../models/product.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PaymentInitiateResponse } from '../models/PaymentInitiateResponse .Interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSource = new BehaviorSubject<CartItem[]>(this.getCartFromLocalStorage());
  cartItems$ = this.cartItemsSource.asObservable(); // Observable để các component theo dõi
  private apiUrlPayment = 'https://localhost:7064/api';
  constructor(private http: HttpClient) { }

  private getCartFromLocalStorage(): CartItem[] {
    const cartJson = localStorage.getItem('shoppingCart');
    return cartJson ? JSON.parse(cartJson) : [];
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    localStorage.setItem('shoppingCart', JSON.stringify(items));
    this.cartItemsSource.next(items); // Thông báo thay đổi
  }

  // Lấy danh sách các item trong giỏ hàng hiện tại
  getCartItems(): CartItem[] {
    return this.cartItemsSource.getValue();
  }

  // Thêm sản phẩm vào giỏ hàng
  addItem(product: Product, quantity: number = 1): void {
    const currentItems = this.getCartItems();
    const existingItemIndex = currentItems.findIndex(item => item.productId === product.productId);

    if (existingItemIndex > -1) {
      // Sản phẩm đã có, tăng số lượng
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Sản phẩm chưa có, thêm mới
      const newItem: CartItem = {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl
      };
      currentItems.push(newItem);
    }
    this.saveCartToLocalStorage(currentItems);
  }

  // Xóa item khỏi giỏ hàng
  removeItem(productId: number): void {
    let currentItems = this.getCartItems();
    currentItems = currentItems.filter(item => item.productId !== productId);
    this.saveCartToLocalStorage(currentItems);
  }

  // Cập nhật số lượng của một item
  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.getCartItems();
    const itemIndex = currentItems.findIndex(item => item.productId === productId);
    if (itemIndex > -1 && quantity > 0) {
      currentItems[itemIndex].quantity = quantity;
      this.saveCartToLocalStorage(currentItems);
    } else if (quantity <= 0) {
      // Nếu số lượng <= 0 thì xóa item
      this.removeItem(productId);
    }
  }

  // Xóa toàn bộ giỏ hàng
  clearCart(): void {
    this.saveCartToLocalStorage([]);
  }

  // Lấy tổng số lượng sản phẩm trong giỏ
  getTotalItems(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }

  // Lấy tổng tiền của giỏ hàng
  getTotalAmount(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
    );
  }


  // ----- Chức năng gọi API Thanh toán (Sẽ cần HttpClient) -----
  checkout(orderId: number): Observable<PaymentInitiateResponse> { // Thay 'any' bằng interface Order/Transaction phù hợp
    const checkoutUrl = `${this.apiUrlPayment}/Payments/create-for-order`; // Ví dụ URL API
    const body = {
      orderId: orderId,
      paymentMethodId: 1, // Hoặc ID phương thức thanh toán được chọn
      ReturnUrl: '',
      CancelUrl: ''
    };
    console.log('Calling API to create payment:', checkoutUrl, 'with body:', body);
    return this.http.post<PaymentInitiateResponse>(checkoutUrl, body)
      .pipe(catchError(this.handleError));
  }
  // Gọi API tạo đơn hàng (POST /api/orders/checkout)
  createOrder(orderData: any): Observable<{ orderId: number, message: string }> { // Điều chỉnh kiểu trả về nếu cần
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${this.authService.getToken()}` // Nếu API yêu cầu token
      })
    };
    return this.http.post<{ orderId: number, message: string }>(`${this.apiUrlPayment}/orders/checkout`, orderData, httpOptions);
  }
  private handleError(error: any) {
    console.error('API Error:', error);
    // Trả về một thông báo lỗi thân thiện với người dùng hoặc throwError
    return throwError(() => new Error('Đã xảy ra lỗi khi gọi API. Vui lòng thử lại.'));
  }
}