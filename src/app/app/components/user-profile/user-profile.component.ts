import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators'; // Cần import catchError
import { of, throwError } from 'rxjs'; // Cần import of và throwError
import { UserProfile } from '../../models/userProfileDto.interface';
import { UpdateUserProfile } from '../../models/updateUserProfile.interface';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [RouterModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
profileForm!: FormGroup;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
   // Có thể lưu trữ dữ liệu profile gốc để so sánh hoặc hiển thị
   originalProfile: UserProfile | null = null;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Sử dụng AuthService để gọi API profile
    private router: Router
  ) { }

  ngOnInit(): void {
    // Khởi tạo form với các FormControl và Validators dựa trên UpdateUserProfile
    // Lưu ý: Username không có ở đây vì không được phép sửa từ form này
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required], // firstName của Customer (bắt buộc)
      lastName: [''], // lastName của Customer
      email: ['', [Validators.email]], // email của User
      phoneNumber: [''], // phoneNumber của User
      dateOfBirth: [null], // dateOfBirth của Customer (kiểu date input 'yyyy-MM-dd')
      gender: [null] // gender của Customer
    });

    // Tải dữ liệu profile hiện tại khi component khởi tạo
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.getUserProfile().pipe( // Sử dụng pipe để xử lý Observable
       catchError(error => {
           console.error('Error loading profile:', error);
           this.errorMessage = error.message || 'Không thể tải thông tin profile.';
           this.isLoading = false;
           // Trả về một Observable rỗng để pipeline không bị ngắt
           return of(null); // Trả về null để async pipe trong template xử lý
       })
    )
    .subscribe(profile => {
      if (profile) {
         console.log('Profile data loaded:', profile);
         this.originalProfile = profile; // Lưu profile gốc
        // Đổ dữ liệu profile vào form
        // Truy cập vào nested 'customer' object
        this.profileForm.patchValue({
          firstName: profile.customer?.firstName || '', // Sử dụng ?. và fallback default value
          lastName: profile.customer?.lastName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          // Xử lý định dạng ngày tháng từ backend string sang format 'yyyy-MM-dd' cho input type="date"
          dateOfBirth: profile.customer?.dateOfBirth ? this.formatDateForInput(profile.customer.dateOfBirth) : null,
          gender: profile.customer?.gender // Giới tính có thể là boolean hoặc null
        });
        this.isLoading = false;
      } else {
         // Xử lý trường hợp không load được profile sau khi catchError
         this.profileForm.disable(); // Vô hiệu hóa form nếu không load được dữ liệu
      }
    });
  }

  // Hàm hỗ trợ định dạng ngày tháng từ chuỗi ISO (backend) sang format 'yyyy-MM-dd' cho input type="date"
  // Backend DTO CustomerProfileDetailDto có DateOfBirth là DateTime?, nên có thể nhận ISO string
  private formatDateForInput(dateString: string): string {
      try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
              console.error("Invalid date string provided:", dateString);
              return '';
          }
          const year = date.getFullYear();
          const month = ('0' + (date.getMonth() + 1)).slice(-2);
          const day = ('0' + date.getDate()).slice(-2);
          return `${year}-${month}-${day}`;
      } catch (e) {
          console.error("Error formatting date string:", dateString, e);
          return '';
      }
  }


  onSubmit(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      console.log('Form is invalid', this.profileForm.errors);
       this.errorMessage = 'Vui lòng kiểm tra lại các thông tin nhập liệu.';
       this.successMessage = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Lấy giá trị từ form, nó đã khớp với cấu trúc UpdateUserProfile
    const updatedProfile: UpdateUserProfile = this.profileForm.value;

    // Xử lý định dạng ngày tháng trước khi gửi lên backend
    // Angular form control cho type="date" sẽ trả về string 'yyyy-MM-dd'
    // Backend API (với DateTime?) có thể chấp nhận 'yyyy-MM-dd' hoặc ISO 8601.
    // Gửi 'yyyy-MM-dd' thường là đủ, nhưng nếu backend yêu cầu ISO 8601:
     if (updatedProfile.dateOfBirth) {
          const date = new Date(updatedProfile.dateOfBirth);
          if (!isNaN(date.getTime())) {
              // Chuyển về ISO 8601 string. toISOString() trả về UTC time.
              // updatedProfile.dateOfBirth = date.toISOString();
               // Hoặc giữ nguyên format 'yyyy-MM-dd' nếu backend có thể parse
          } else {
               // Xử lý ngày tháng không hợp lệ nếu Validator không bắt được
              console.error("Invalid Date of Birth entered:", this.profileForm.get('dateOfBirth')?.value);
              this.errorMessage = 'Ngày sinh không hợp lệ.';
              this.isLoading = false;
              return;
          }
     }


    this.authService.updateUserProfile(updatedProfile).pipe(
       catchError(error => {
          console.error('Error updating profile:', error);
          this.errorMessage = error.message || 'Không thể cập nhật profile. Vui lòng thử lại.';
          this.isLoading = false;
          return throwError(() => new Error(this.errorMessage || 'Update failed.')); // Ném lại lỗi sau khi xử lý
       })
    )
    .subscribe(() => {
      console.log('Profile updated successfully');
      this.successMessage = 'Cập nhật profile thành công!';
      this.isLoading = false;
       // Tùy chọn: Tải lại profile sau khi cập nhật để hiển thị dữ liệu mới nhất (bao gồm CreatedAt/UpdatedAt)
       // this.loadUserProfile();
    });
  }

   // Helper getter để truy cập form controls một cách tiện lợi trong template
   get formControls() {
     return this.profileForm.controls;
   }
}
