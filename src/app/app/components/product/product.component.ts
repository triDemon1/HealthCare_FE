import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Cần cho *ngIf, *ngFor, async pipe
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; // Cần cho route params và routerLink
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.interface';
import { map } from 'rxjs/operators';
import { Observable, catchError, tap, of, switchMap, Subscription, combineLatest, BehaviorSubject, startWith } from 'rxjs'; // Cần cho xử lý Observable
import { CartService } from '../../services/cart.service';
import { Pagination } from '../../models/pagination.interface';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit, OnDestroy {
  // filteredProducts$ bây giờ là Observable của PagedResult
  pagedProducts$!: Observable<Pagination<Product>>;

  // Biến để hiển thị tên danh mục hiện tại trên giao diện
  displayedCategoryName: string = 'Tất cả sản phẩm';

  // Trạng thái phân trang
  pageIndex: number = 0; // Trang hiện tại (bắt đầu từ 0)
  pageSize: number = 5; // Số mục mỗi trang (có thể cho phép người dùng thay đổi sau)

  // Mapping ID category sang tên hiển thị thân thiện
  categoryNameMapping: { [key: number]: string } = {
    1: 'Sản phẩm cho Người già', // Sử dụng ID thực tế của bạn
    2: 'Sản phẩm cho Trẻ em',    // Sử dụng ID thực tế của bạn
    3: 'Sản phẩm cho Thú cưng'   // Sử dụng ID thực tế của bạn
    // Thêm các mapping khác nếu cần
  };

  // Sử dụng BehaviorSubject để theo dõi sự thay đổi của các tham số phân trang
  private paginationParamsSubject = new BehaviorSubject<{ pageIndex: number, pageSize: number, categoryId: number | null }>({
    pageIndex: this.pageIndex,
    pageSize: this.pageSize,
    categoryId: null // categoryId ban đầu sẽ được lấy từ route
  });

  private routeSubscription!: Subscription;
  // Không cần allProducts$ nữa vì dữ liệu được tải từng trang

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Lắng nghe sự thay đổi của route params VÀ paginationParamsSubject
    // Mỗi khi một trong hai thay đổi, pipeline sẽ chạy lại
    this.pagedProducts$ = combineLatest([
      this.route.paramMap.pipe(
        // startWith để đảm bảo pipeline chạy lần đầu với param map hiện tại
        startWith(this.route.snapshot.paramMap),
        // Lấy categoryId từ route params
        map(params => {
          const categoryIdString = params.get('categoryId');
          return categoryIdString ? +categoryIdString : null;
        })
      ),
      this.paginationParamsSubject.asObservable() // Theo dõi các tham số phân trang
    ]).pipe(
      // switchMap để gọi service khi có sự thay đổi ở route param HOẶC pagination params
      switchMap(([categoryIdFromRoute, paginationParams]) => {

        const currentCategoryId = categoryIdFromRoute; // Lấy ID từ route
        this.updateDisplayedCategoryName(currentCategoryId); // Cập nhật tên hiển thị

        // Gọi service với các tham số hiện tại
        return this.productService.getPagedProducts(
          this.pageIndex, // Sử dụng pageIndex và pageSize hiện tại của component state
          this.pageSize,
          currentCategoryId // Sử dụng categoryId từ route
        ).pipe(
           catchError(error => {
              console.error('Error loading paged products:', error);
              // TODO: Hiển thị thông báo lỗi trên UI
              return of({ items: [], totalCount: 0, pageIndex: this.pageIndex, pageSize: this.pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false }); // Trả về kết quả rỗng nếu lỗi
           })
        );
      }),
      // Optional: tap to log the received paged result
      tap(pagedResult => {
         console.log('Loaded page:', pagedResult.pageIndex, 'Items:', pagedResult.items.length, 'Total:', pagedResult.totalCount);
      })
    );
  }

  ngOnDestroy(): void {
    this.paginationParamsSubject.complete();
  }

  // Cập nhật tên danh mục hiển thị dựa trên categoryId từ route
  updateDisplayedCategoryName(categoryId: number | null): void {
       if (categoryId === null) {
           this.displayedCategoryName = 'Tất cả sản phẩm';
       } else {
           this.displayedCategoryName = this.categoryNameMapping[categoryId] || `Danh mục ID ${categoryId}`;
       }
  }


  // Phương thức được gọi khi click vào các danh mục cụ thể (thay đổi route)
  filterByCategory(event: Event, categoryId: number): void {
    event.preventDefault();
    // Reset về trang 0 khi thay đổi danh mục
    this.pageIndex = 0;
    this.router.navigate(['/products', categoryId]);
  }

  // Phương thức được gọi khi click vào "Tất cả sản phẩm" (thay đổi route)
  showAllProducts(event: Event): void {
    event.preventDefault();
    // Reset về trang 0 khi hiển thị tất cả sản phẩm
    this.pageIndex = 0;
    this.router.navigate(['/products']);
  }

  // Phương thức chuyển trang
  goToPage(pageIndex: number): void {
    // Kiểm tra pageIndex hợp lệ
    if (pageIndex >= 0 && this.pagedProducts$) {
        // Cần lấy totalPages từ kết quả PagedResult cuối cùng
        // Có thể subscribe tạm thời hoặc lưu totalPages vào biến riêng
        // Cách tốt hơn là dùng async pipe trong template để kiểm tra nút
        // hoặc lưu pagedResult vào biến trong tap()

        // Giả sử bạn đã lưu kết quả trang cuối cùng vào một biến (ví dụ: lastPagedResult)
        // if (pageIndex < this.lastPagedResult.totalPages) { ... }

        this.pageIndex = pageIndex;
        // Kích hoạt lại pipeline bằng cách "giả" cập nhật params (chỉ cần next với giá trị hiện tại)
        // Điều này sẽ khiến combineLatest phát ra giá trị mới và trigger switchMap
        this.paginationParamsSubject.next({ // Cập nhật Subject để trigger refetch
           pageIndex: this.pageIndex,
           pageSize: this.pageSize,
           categoryId: this.route.snapshot.paramMap.get('categoryId') ? +this.route.snapshot.paramMap.get('categoryId')! : null // Lấy ID hiện tại từ route snapshot
        });
    }
  }

  // Phương thức thêm vào giỏ hàng (giữ nguyên)
  addToCart(product: Product): void {
    console.log('Adding to cart:', product.name);
    this.cartService.addItem(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }

  // Các phương thức kiểm tra trang (sử dụng trong template để disable nút)
  isFirstPage(pagedResult: Pagination<Product>): boolean {
      return pagedResult.pageIndex === 0;
  }

  isLastPage(pagedResult: Pagination<Product>): boolean {
      return pagedResult.pageIndex >= pagedResult.totalPages - 1;
  }

  // Lấy mảng số trang để hiển thị nút
  getPageNumbers(pagedResult: Pagination<Product>): number[] {
    if (!pagedResult || pagedResult.totalPages <= 0) {
        return [];
    }
    // Tạo mảng từ 0 đến totalPages - 1
    return Array.from({ length: pagedResult.totalPages }, (_, i) => i);
  }
}
