import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Import CommonModule và CurrencyPipe
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/CartItem.interface';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms'; // Import FormsModule để dùng [(ngModel)]
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { PaymentInitiateResponse } from '../../models/PaymentInitiateResponse .Interface';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;
  totalAmount$: Observable<number>;
  isLoading: boolean = false; // Thêm biến để quản lý trạng thái loading

  constructor(private cartService: CartService, private authService: AuthService, private router: Router) {
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
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } }); // Chuyển hướng đến đăng nhập
      return;
    }

    const orderPayload = {
      addressId: this.authService.getAddressId(), // CẦN CÓ ADDRESS ID
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    // 4. Gọi API để tạo đơn hàng (Order) trên backend
    this.cartService.createOrder(orderPayload).subscribe({
      next: async (orderResponse) => { // Thêm async ở đây
        console.log('Order created successfully:', orderResponse);
        if (orderResponse && orderResponse.orderId) {
          // 5. Nếu tạo đơn hàng thành công, tiến hành tạo thanh toán MoMo

          this.cartService.checkout(orderResponse.orderId).subscribe({
            next: (paymentResponse: PaymentInitiateResponse) => {
              if (paymentResponse.success && paymentResponse.paymentUrl) {
                console.log('Create payment successful, redirecting to MoMo:', paymentResponse.paymentUrl);
                this.cartService.clearCart(); // Xóa giỏ hàng sau khi đã tạo yêu cầu thanh toán
                window.location.href = paymentResponse.paymentUrl; // Chuyển hướng người dùng đến trang MoMo
              } else {
                alert(`Khởi tạo thanh toán MoMo thất bại: ${paymentResponse.message || 'Lỗi không xác định.'}`);
                console.error('Create payment failed:', paymentResponse);
              }
              this.isLoading = false; // Kết thúc loading
            },
            error: (paymentErr) => {
              console.error('Create payment API call failed:', paymentErr);
              alert('Lỗi khi gọi API tạo thanh toán. Vui lòng thử lại.');
              this.isLoading = false; // Kết thúc loading
            }
          });
        } else {
          alert('Tạo đơn hàng thất bại: Không nhận được Order ID.');
          this.isLoading = false; // Kết thúc loading
        }
      },
      error: (orderErr) => {
        console.error('Create order API call failed:', orderErr);
        let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại.';
        if (orderErr.error && orderErr.error.message) {
            errorMessage = orderErr.error.message;
        } else if (typeof orderErr.error === 'string') {
            errorMessage = orderErr.error;
        }
        alert(errorMessage);
        this.isLoading = false; // Kết thúc loading
      }
    });
  }
}
