import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for forms
import { ActivatedRoute, Router } from '@angular/router'; // Import for routing
import { RoleDto } from '../../../../models/RoleDto.interface';
import { UserCreateUpdateDto } from '../../../../models/UserCreateUpdateDto.interface';
import { AdminService } from '../../../../services/admin.service';
import { UserAdminDto } from '../../../../models/userAdminDto';

@Component({
  selector: 'app-user-create-update',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-create-update.component.html',
  styleUrl: './user-create-update.component.css'
})
export class UserCreateUpdateComponent implements OnInit {
  userId: number | null = null; // Null for create, number for update
  user: UserCreateUpdateDto = {
    username: '',
    email: '',
    isActive: true,
    roleId: 0 // Default role ID, needs to be selected
  };
  roles: RoleDto[] = []; // For role dropdown
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  customerRoleId: number = 2; // <-- Thay bằng RoleId thực tế của Customer
  staffRoleId: number = 3;    // <-- Thay bằng RoleId thực tế của Staff
  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute, // To get route parameters
    public router: Router // To navigate
  ) { }

  ngOnInit(): void {
    // Load roles for the dropdown
    this.loadRoles();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id; // Convert string ID to number
        this.loadUser(this.userId);
      }
    });
  }

  loadUser(userId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminService.getUserById(userId).subscribe({
      next: (data: UserAdminDto) => { // Cast data to UserAdminDto (updated interface)
        // Map UserAdminDto to UserCreateUpdateDto for the form
        this.user = {
          username: data.username,
          // password is not loaded for security reasons
          email: data.email,
          phoneNumber: data.phoneNumber,
          isActive: data.isActive,
          roleId: data.roleId,
          // Map nested Customer/Staff DTOs to customerData/staffData if they exist
          customerData: data.customer ? { // If data.customer exists (UserAdminDetailDto)
            firstName: data.customer.firstName,
            lastName: data.customer.lastName,
            dateOfBirth: data.customer.dateOfBirth ? new Date(data.customer.dateOfBirth).toISOString().substring(0, 10) : undefined, // Format date for input type="date"
            gender: data.customer.gender
          } : undefined, // If data.customer is null, customerData is undefined

          staffData: data.staff ? { // If data.staff exists (StaffAdminDetailDto)
            firstName: data.staff.firstName,
            lastName: data.staff.lastName,
            phoneNumber: data.staff.phoneNumber,
            skills: data.staff.skills,
            expYear: data.staff.expYear,
            isAvailable: data.staff.isAvailable
            // Note: StaffCreateUpdateDto doesn't have CreateAt/UpdatedAt, which is correct for input DTO
          } : undefined
        };
        this.isLoading = false;
        console.log(this.user);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.errorMessage = 'Không thể tải thông tin người dùng.';
        this.isLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.adminService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        // Optional: Find Customer and Staff role IDs after loading roles
        const customerRole = this.roles.find(r => r.roleName === 'Customer'); // <-- Thay 'Customer' bằng tên role thực tế
        if (customerRole) this.customerRoleId = customerRole.roleId;
        console.log(this.customerRoleId);
        const staffRole = this.roles.find(r => r.roleName === 'Staff'); // <-- Thay 'Staff' bằng tên role thực tế
        if (staffRole) this.staffRoleId = staffRole.roleId;
        console.log(this.staffRoleId);
      },
      error: (err) => console.error('Error fetching roles:', err)
    });
  }

  // Hàm xử lý khi vai trò thay đổi
  onRoleChange(): void {
    // Reset customerData và staffData khi thay đổi vai trò
    this.user.roleId = +this.user.roleId;

    // ✅ KHÔNG chỉ kiểm tra isCreateMode — vì cập nhật user cũng cần chuẩn bị dữ liệu
    if (this.isCustomerRole() && !this.user.customerData) {
      this.user.customerData = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: undefined
      };
    }

    if (this.isStaffRole() && !this.user.staffData) {
      this.user.staffData = {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        skills: '',
        expYear: 0,
        isAvailable: false
      };
    }
  }


  onSubmit(): void {
    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Basic validation (add more as needed)
    if (!this.user.username || !this.user.email || this.user.roleId <= 0) {
      this.errorMessage = "Vui lòng điền đầy đủ các trường bắt buộc (Username, Email, Vai trò).";
      this.isSaving = false;
      return;
    }
    if (this.isCreateMode() && !this.user.password) { // Password required for create
      this.errorMessage = "Mật khẩu là bắt buộc khi tạo người dùng mới.";
      this.isSaving = false;
      return;
    }

    // Validate Customer/Staff data if role requires it
    if (this.user.roleId === this.customerRoleId && (!this.user.customerData || !this.user.customerData.firstName)) {
      this.errorMessage = "Vui lòng điền đầy đủ thông tin Khách hàng (Tên).";
      this.isSaving = false;
      return;
    }
    if (this.user.roleId === this.staffRoleId && (!this.user.staffData || !this.user.staffData.firstName || !this.user.staffData.lastName)) {
      this.errorMessage = "Vui lòng điền đầy đủ thông tin Nhân viên (Tên, Họ).";
      this.isSaving = false;
      return;
    }


    // Prepare payload - ensure only relevant data is sent
    const payload: UserCreateUpdateDto = {
      username: this.user.username,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber,
      isActive: this.user.isActive,
      roleId: this.user.roleId,
      password: this.user.password // Send password only if entered (for update) or required (for create)
    };

    // Conditionally add customerData or staffData to payload
    if (this.user.roleId === this.customerRoleId && this.user.customerData) {
      payload.customerData = {
        firstName: this.user.customerData.firstName,
        lastName: this.user.customerData.lastName,
        dateOfBirth: this.user.customerData.dateOfBirth, // Send as string or Date
        gender: this.user.customerData.gender
      };
    } else {
      // Explicitly set to null if not Customer role, so backend can handle deletion
      payload.customerData = null;
    }

    if (this.user.roleId === this.staffRoleId && this.user.staffData) {
      payload.staffData = {
        firstName: this.user.staffData.firstName,
        lastName: this.user.staffData.lastName,
        phoneNumber: this.user.staffData.phoneNumber,
        skills: this.user.staffData.skills,
        expYear: this.user.staffData.expYear,
        isAvailable: this.user.staffData.isAvailable
      };
    } else {
      // Explicitly set to null if not Staff role, so backend can handle deletion
      payload.staffData = null;
    }


    if (this.userId) {
      // Update existing user
      this.adminService.updateUser(this.userId, payload).subscribe({ // Send payload
        next: (data) => {
          this.successMessage = 'Cập nhật người dùng thành công!';
          this.isSaving = false;
          // Optionally navigate back to user list or stay on page
          // this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.errorMessage = err.message || 'Không thể cập nhật người dùng.';
          this.isSaving = false;
        }
      });
    } else {
      // Create new user
      this.adminService.createUser(payload).subscribe({ // Send payload
        next: (data) => {
          this.successMessage = 'Tạo người dùng thành công!';
          this.isSaving = false;
          // Navigate to user list after creation
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.errorMessage = err.message || 'Không thể tạo người dùng.';
          this.isSaving = false;
        }
      });
    }
  }

  // Helper to check if in create mode
  isCreateMode(): boolean {
    return this.userId === null;
  }

  // Helper to check if in update mode
  isUpdateMode(): boolean {
    return this.userId !== null;
  }

  // Helper to check if selected role is Customer
  isCustomerRole(): boolean {
    return this.user.roleId === this.customerRoleId;
  }

  // Helper to check if selected role is Staff
  isStaffRole(): boolean {
    return this.user.roleId === this.staffRoleId;
  }
}
