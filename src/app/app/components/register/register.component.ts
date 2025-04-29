// src/app/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// *** Import các module và lớp cần thiết cho Reactive Forms ***
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// *** Import service và interface đã tạo ***
import { RegisterData } from '../../models/register.interface'; // Service gọi API đăng ký
import { RegisterService } from '../../services/register.service'; // Interface định nghĩa cấu trúc dữ liệu gửi đi

import { Router } from '@angular/router'; // Để điều hướng sau khi đăng ký thành công

@Component({
  selector: 'app-register',
  standalone: true, // Đây là Standalone Component
  imports: [
    CommonModule,
    ReactiveFormsModule, // *** Sử dụng ReactiveFormsModule ***
    // Các module khác nếu cần (ví dụ: HttpClientModule nếu gọi API trực tiếp ở đây, nhưng ta dùng service nên không cần)
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // *** Khai báo FormGroup cho Reactive Forms ***
  registerForm!: FormGroup;

  errorMessage: string | null = null; // Để hiển thị thông báo lỗi từ backend hoặc validation

  constructor(
    // *** Inject RegisterService và FormBuilder ***
    private registerService: RegisterService, // Inject RegisterService mới
    private router: Router, // Inject Router để điều hướng
    private fb: FormBuilder // Inject FormBuilder để xây dựng form
  ) { }

  ngOnInit(): void {
    // *** Khởi tạo FormGroup với các FormControl và Validators ***
    // Đặt Validators.required cho TẤT CẢ các trường để yêu cầu nhập
    this.registerForm = this.fb.group({
      // Thông tin tài khoản (USER)
      username: ['', [Validators.required, Validators.minLength(3)]], // Tên đăng nhập, bắt buộc, tối thiểu 3 ký tự
      password: ['', [Validators.required, Validators.minLength(6)]], // Mật khẩu, bắt buộc, tối thiểu 6 ký tự (nên dùng Validators mạnh hơn trong thực tế)
      email: ['', [Validators.required, Validators.email]], // Email, bắt buộc và đúng định dạng email
      phoneNumber: ['', Validators.required], // Số điện thoại, BẮT BUỘC

      // Thông tin cá nhân (CUSTOMERS)
      firstName: ['', Validators.required], // Tên, bắt buộc
      lastName: ['', Validators.required], // Họ đệm, BẮT BUỘC
      dateOfBirth: [null, Validators.required], // Ngày sinh, BẮT BUỘC
      gender: [null, Validators.required], // Giới tính, BẮT BUỘC (null ban đầu)

      // Thông tin địa chỉ (ADDRESSES)
      country: ['', Validators.required], // Quốc gia, BẮT BUỘC
      street: ['', Validators.required], // Đường/Số nhà, BẮT BUỘC
      ward: ['', Validators.required], // Phường/Xã, BẮT BUỘC
      district: ['', Validators.required], // Quận/Huyện, BẮT BUỘC
      city: ['', Validators.required] // Tỉnh/Thành phố, BẮT BUỘC
    });
  }

  /**
   * Xử lý khi form đăng ký được submit.
   */
  onSubmit(): void {
    this.errorMessage = null; // Reset lỗi trước mỗi lần submit

    // *** Kiểm tra trạng thái validation của form ***
    if (this.registerForm.invalid) {
      // Nếu form không hợp lệ, hiển thị lỗi validation
      console.log('Form is invalid', this.registerForm.errors);
      // Đánh dấu tất cả các control là touched để hiển thị lỗi validation trên UI
      this.markAllAsTouched(this.registerForm);
      this.errorMessage = 'Vui lòng điền đầy đủ và chính xác thông tin vào các trường bắt buộc.'; // Thông báo lỗi chung
      return; // Dừng xử lý nếu form không hợp lệ
    }

    // *** Lấy dữ liệu từ form ***
    // registerForm.value sẽ trả về một object có cấu trúc khớp với RegisterData interface
    const dataToSubmit: RegisterData = this.registerForm.value;

    // Gọi service để gửi dữ liệu đăng ký đến backend
    this.registerService.register(dataToSubmit).subscribe({
      next: (response) => {
        // Xử lý thành công: API trả về 200 OK
        console.log('Registration successful', response); // Log 1: Đã nhận được phản hồi thành công
        alert('Đăng ký thành công! Vui lòng đăng nhập.'); // Hiển thị alert
        console.log('Attempting to navigate to /login'); // Log 2: Trước khi chuyển hướng
        this.router.navigate(['/login'])
          .then(success => {
             console.log('Navigation successful:', success); // Log 3: Chuyển hướng thành công
          })
          .catch(err => {
             console.error('Navigation failed:', err); // Log 4: Chuyển hướng thất bại
             // Nếu chuyển hướng thất bại, có thể hiển thị lỗi cụ thể hơn
             this.errorMessage = 'Đăng ký thành công nhưng không thể chuyển hướng đến trang đăng nhập. Vui lòng truy cập thủ công.';
          });
      },
      error: (error) => {
        // Xử lý lỗi từ backend
        console.error('Registration failed', error);

        // Kiểm tra status code và cấu trúc lỗi từ backend
        if (error.status === 409 && error.error && typeof error.error === 'object' && error.error.errorMessage) {
             // Nếu backend trả về 409 Conflict với body là object { errorMessage: "..." }
             this.errorMessage = error.error.errorMessage; // Lấy thông báo lỗi cụ thể từ backend
        } else if (error.status === 400 && error.error) {
             // Nếu backend trả về 400 Bad Request (thường là lỗi validation từ ModelState)
             // error.error thường là một object chứa các lỗi validation theo tên trường
             let validationErrors = 'Lỗi validation từ server:\n';
             // Lặp qua các lỗi trả về từ backend
             for (const key in error.error) {
                 if (error.error.hasOwnProperty(key)) {
                     // error.error[key] là một mảng các lỗi cho trường đó
                     validationErrors += `- ${key}: ${error.error[key].join(', ')}\n`;
                 }
             }
             this.errorMessage = validationErrors; // Hiển thị chi tiết lỗi validation
        }
        else {
            // Xử lý các loại lỗi khác hoặc lỗi không xác định
            this.errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau.';
        }
      }
    });
  }

  /**
   * Hàm helper để đánh dấu tất cả các control trong form là touched.
   * Giúp hiển thị lỗi validation khi người dùng nhấn submit mà form chưa hợp lệ.
   * @param formGroup Nhóm form cần đánh dấu.
   */
  private markAllAsTouched(formGroup: FormGroup): void {
    // Lặp qua tất cả các control trong form group
    Object.values(formGroup.controls).forEach(control => {
      // Đánh dấu control là touched
      control.markAsTouched();
      // Nếu control là một FormGroup lồng nhau, đệ quy gọi lại hàm
      if ((control as any).controls) {
        this.markAllAsTouched(control as FormGroup);
      }
    });
  }

  /**
   * Getter để dễ dàng truy cập các form control trong template (.html).
   * Ví dụ: <input [formControlName]="f['username']">
   */
  get f() { return this.registerForm.controls; }
}
