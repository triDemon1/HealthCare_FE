import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Import CommonModule và CurrencyPipe
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/CartItem.interface';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms'; // Import FormsModule để dùng [(ngModel)]

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;
  totalAmount$: Observable<number>;

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$; // Lấy observable từ service
    this.totalAmount$ = this.cartService.getTotalAmount(); // Lấy observable tổng tiền
  }

  ngOnInit(): void {}

  // Cập nhật số lượng
  updateQuantity(item: CartItem, newQuantity: number): void {
    // Chuyển đổi sang số nguyên
    const quantity = parseInt(newQuantity.toString(), 10);
    if (!isNaN(quantity) && quantity >= 0) {
      console.log(`Updating quantity for ${item.name} to ${quantity}`);
      this.cartService.updateQuantity(item.productId, quantity);
    } else if (quantity < 0) {
       // Ngăn người dùng nhập số âm, có thể đặt lại thành 1 hoặc giá trị cũ
       // Ví dụ: item.quantity = 1; // Reset lại quantity trên input
       console.warn("Quantity cannot be negative.");
    }
  }

  // Xóa item
  removeItem(productId: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        console.log('Removing item with ID:', productId);
        this.cartService.removeItem(productId);
    }
  }

  // Xóa toàn bộ giỏ hàng
  clearCart(): void {
     if (confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
        console.log('Clearing cart');
        this.cartService.clearCart();
     }
  }

  // Hàm xử lý khi nhấn nút thanh toán
  proceedToCheckout(): void {
    console.log('Proceeding to checkout...');
    // 1. Lấy thông tin giỏ hàng hiện tại
    const items = this.cartService.getCartItems();
    if (items.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    // 2. (Tùy chọn) Kiểm tra đăng nhập
    // if (!this.authService.isLoggedIn()) {
    //   this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } }); // Chuyển hướng đến đăng nhập
    //   return;
    // }

    // 3. Tạo đối tượng đơn hàng/giao dịch để gửi lên backend
    // const orderData = {
    //   customerId: this.authService.getCurrentUserId(), // Lấy ID khách hàng đã đăng nhập
    //   items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
    //   // Thêm các thông tin khác nếu cần: địa chỉ giao hàng, phương thức thanh toán...
    // };

    // 4. Gọi API thanh toán (ví dụ)
    // this.cartService.checkout(orderData).subscribe({
    //   next: (response) => {
    //     console.log('Checkout successful:', response);
    //     alert('Đặt hàng thành công!');
    //     this.cartService.clearCart(); // Xóa giỏ hàng sau khi thành công
    //     // Chuyển hướng đến trang xác nhận đơn hàng
    //     // this.router.navigate(['/order-confirmation', response.orderId]);
    //   },
    //   error: (err) => {
    //     console.error('Checkout failed:', err);
    //     alert('Đặt hàng thất bại. Vui lòng thử lại.');
    //   }
    // });

    // Hiện tại chỉ điều hướng đến trang checkout giả định
    alert('Chuyển đến trang thanh toán (Demo)');
    // this.router.navigate(['/checkout']); // Điều hướng đến trang checkout thực tế
  }
}
