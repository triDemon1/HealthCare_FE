import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Cần cho *ngIf, *ngFor, async pipe
import { ActivatedRoute, RouterModule } from '@angular/router'; // Cần cho route params và routerLink

import { ProductService } from '../../../services/product.service'; // Import service
import { Product } from '../../../models/product.interface'; // Import interface

import { Observable, switchMap, tap, of } from 'rxjs'; // Cần cho xử lý Observable

@Component({
  selector: 'app-pet-product-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-product-list.component.html',
  styleUrl: './pet-product-list.component.css'
})
export class PetProductListComponent implements OnInit {
  products$!: Observable<Product[]>; // Observable chứa danh sách sản phẩm
  currentCategory: string | null = null; // Lưu trữ tên danh mục hiện tại

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute để đọc thông tin route
    private productService: ProductService // Inject ProductService để lấy dữ liệu
     // Inject CartService nếu sử dụng giỏ hàng thực tế
    // private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Theo dõi sự thay đổi của route parameters.
    // switchMap sẽ chuyển từ Observable của route.paramMap sang Observable của productService.
    // Nếu paramMap thay đổi (người dùng chuyển danh mục), switchMap sẽ hủy request cũ (nếu chưa hoàn thành)
    // và tạo request mới cho danh mục hiện tại.
    this.products$ = this.route.paramMap.pipe(
      tap(params => {
        // Lấy giá trị của 'category' từ route parameters.
        // Dấu '!' sau get('category') là Non-null assertion operator,
        // sử dụng khi bạn chắc chắn giá trị không null (dựa vào cấu hình route).
        this.currentCategory = params.get('category');
        console.log('Loading products for category:', this.currentCategory); // Log để kiểm tra
      }),
      switchMap(params => {
        const category = params.get('category');
        if (category) {
          // Gọi service để lấy sản phẩm theo danh mục
          return this.productService.getProductsByCategory(category);
        } else {
          // Xử lý trường hợp không có danh mục trong route (ví dụ: route gốc /products)
          // Có thể trả về Observable rỗng hoặc toàn bộ sản phẩm
          console.warn('No category parameter found in route.');
          //return this.productService.getProducts(); // Giả định ProductService có getProducts()
          return of([]); // Hoặc trả về Observable rỗng
        }
      })
    );
  }

  // Phương thức xử lý khi click nút "Thêm vào giỏ hàng"
  addToCart(product: Product): void {
    console.log('Clicked Add to Cart for:', product.name, product.id);
    // Đây là nơi bạn sẽ gọi service giỏ hàng (ví dụ: cartService.addItem(product))
    // Hiển thị thông báo, cập nhật biểu tượng giỏ hàng, v.v.
    alert(`Đã thêm "${product.name}" vào giỏ hàng! (Đây là demo)`); // Demo thông báo
  }
  
  // Hàm helper để hiển thị tên danh mục thân thiện hơn (tùy chọn)
  getFriendlyCategoryName(category: string | null): string {
    if (!category) return 'Tất cả sản phẩm'; // Hoặc tên mặc định khác
    switch (category) {
      case 'dog-food': return 'Thức ăn cho Chó';
      case 'cat-food': return 'Thức ăn cho Mèo';
      case 'equipment': return 'Thiết bị & Phụ kiện';
      case 'toys': return 'Đồ chơi';
      default: return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '); // Capitalize và thay '-' bằng ' '
    }
  }
}

