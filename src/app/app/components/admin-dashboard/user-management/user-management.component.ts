import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserAdminDto } from '../../../models/userAdminDto';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Pagination } from '../../../models/pagination.interface';
import { Observable, BehaviorSubject, Subscription, startWith, switchMap, tap, catchError, of, combineLatest, map } from 'rxjs';
@Component({
  selector: 'app-user-management',
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage: string | null = null;
  // Observable chứa kết quả phân trang
  pagedUsers$!: Observable<Pagination<UserAdminDto>>;
  displayedRoleName: string = 'Tất cả người dùng';

  // Trạng thái phân trang
  pageIndex: number = 0; // Index trang hiện tại (bắt đầu từ 0)
  pageSize: number = 5; // Số mục mỗi trang (có thể thay đổi)
  roleNameMapping: { [key: number]: string } = {
    1: 'Admin',
    2: 'Khách hàng',  
    3: 'Nhân viên' 
  };

  // Subject để chủ động kích hoạt việc tải lại dữ liệu (khi chuyển trang, xóa user)
  private paginationParamsSubject = new BehaviorSubject<{ pageIndex: number, pageSize: number, roleId: number | null }>({
    pageIndex: this.pageIndex,
    pageSize: this.pageSize,
    roleId: null
  });
  


  // Không cần ActivatedRoute cho kịch bản phân trang này trừ khi bạn đọc page/size từ URL
  // private routeSubscription!: Subscription;
  private pagedUsersSubscription!: Subscription;

  constructor(private adminService: AdminService, public router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadUsers();
  }
  ngOnDestroy(): void {
    this.paginationParamsSubject.complete();
  }

  loadUsers(): void {
    this.pagedUsers$ = combineLatest([
      this.route.paramMap.pipe(
        startWith(this.route.snapshot.paramMap),
        map(params => {
          const roleId = params.get('roleId');
          console.log('### Debug: Route param roleId string:', roleId);
          return roleId ? +roleId : null
        })
      ),
      this.paginationParamsSubject.asObservable()
    ]).pipe(
      switchMap(([roleIdFromRoute, paginationParams]) => {
        // this.isLoading = true; // Bật trạng thái loading trước khi gọi API
        // this.errorMessage = null; // Xóa lỗi trước đó
        const currentRoleId = roleIdFromRoute; // Lấy ID từ route
        console.log("CurrentRoleId:", currentRoleId);
        this.updateDisplayedRoleName(currentRoleId); // Cập nhật tên hiển thị

        // Gọi service để lấy dữ liệu phân trang với pageIndex và pageSize hiện tại
        return this.adminService.getPagedUsers(this.pageIndex, this.pageSize, currentRoleId).pipe(
          tap(result => {
            console.log("Phản hồi dữ liệu phân trang:", result);
            this.isLoading = false; // Tắt trạng thái loading khi nhận được dữ liệ
          }),
          catchError(err => {
            console.error('Error fetching paged users:', err);
            this.errorMessage = 'Không thể tải danh sách người dùng. Vui lòng thử lại.';
            this.isLoading = false; // Tắt trạng thái loading khi có lỗi
            // Trả về một Observable rỗng với cấu trúc PagedResult để template không bị lỗi
            return of({ items: [], totalCount: 0, pageIndex: this.pageIndex, pageSize: this.pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
          }),
          tap(pagedResult => {
            console.log('Loaded page:', pagedResult.pageIndex, 'Items:', pagedResult.items.length, 'Total:', pagedResult.totalCount);
          })
        );
      })
    );

    // Optional: Subscribe để theo dõi kết quả hoặc thực hiện hành động phụ
    // this.pagedUsersSubscription = this.pagedUsers$.subscribe(pagedResult => {
    //    // Có thể làm gì đó với pagedResult ở đây nếu cần
    // });
  }
  updateDisplayedRoleName(roleId: number | null): void {
    if (roleId === null) {
      this.displayedRoleName = 'Tất cả người dùng';
    } else {
      this.displayedRoleName = this.roleNameMapping[roleId] || `Vai trò ID ${roleId}`;
    }
  }
  // Hàm xác nhận xóa người dùng
  confirmDeleteUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) { // Hiển thị hộp thoại xác nhận
      this.deleteUser(userId); // Nếu xác nhận, gọi hàm xóa
    }
  }

  // Hàm gọi service để xóa người dùng
  deleteUser(userId: number): void {
    this.adminService.deleteUser(userId).subscribe( // Gọi hàm deleteUser từ AdminService
      () => {
        console.log('User deleted successfully');
        this.loadUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
        // Hiển thị thông báo xóa thành công cho người dùng (tùy chọn)
        alert('Xóa người dùng thành công');
      },
      (error) => {
        console.error('Error deleting user:', error); //
        // Xử lý lỗi khi xóa người dùng, hiển thị thông báo lỗi cho người dùng
        alert(`Lỗi khi xóa người dùng: ${error.message || error}`); // Hiển thị thông báo lỗi
      }
    );
  }
  isFirstPage(pagedResult: Pagination<UserAdminDto>): boolean {
    return pagedResult.pageIndex === 0;
  }

  isLastPage(pagedResult: Pagination<UserAdminDto>): boolean {
    // Kiểm tra xem pageIndex có phải là trang cuối cùng không
    // totalPages được tính từ backend, kiểm tra pagedResult có tồn tại trước
    return pagedResult && pagedResult.totalPages > 0 && pagedResult.pageIndex >= pagedResult.totalPages - 1;
  }

  // Helper method để tạo mảng số trang hiển thị (sử dụng trong *ngFor)
  getPageNumbers(pagedResult: Pagination<UserAdminDto>): number[] {
    if (!pagedResult || pagedResult.totalPages <= 0) {
      return [];
    }
    // Tạo mảng các số từ 0 đến totalPages - 1
    return Array.from({ length: pagedResult.totalPages }, (_, i) => i);
  }
  goToPage(pageIndex: number): void {
    // Kiểm tra pageIndex hợp lệ
    if (pageIndex >= 0 && this.pagedUsers$) {
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
           roleId: this.route.snapshot.paramMap.get('roleId') ? +this.route.snapshot.paramMap.get('roleId')! : null // Lấy ID hiện tại từ route snapshot
        });
    }
  }
  filterByRole(event: Event, roleId: number): void {
    event.preventDefault();
    // Reset về trang 0 khi thay đổi danh mục
    this.pageIndex = 0;
    this.router.navigate(['/admin/users', roleId]);
  }

  showAllUsers(event: Event): void {
    event.preventDefault();
    // Reset về trang 0 khi hiển thị tất cả sản phẩm
    this.pageIndex = 0;
    this.router.navigate(['/admin/users']);
  }
}
