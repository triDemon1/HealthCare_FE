// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../models/CartItem.interface';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSource = new BehaviorSubject<CartItem[]>(this.getCartFromLocalStorage());
  cartItems$ = this.cartItemsSource.asObservable(); // Observable để các component theo dõi

  constructor() { }

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
  // checkout(orderDetails: any): Observable<any> { // Thay 'any' bằng interface Order/Transaction phù hợp
  //   const checkoutUrl = `${environment.apiUrl}/api/orders/checkout`; // Ví dụ URL API
  //   return this.http.post(checkoutUrl, orderDetails);
  // }
}