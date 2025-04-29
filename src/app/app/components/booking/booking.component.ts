import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingPayload } from '../../models/bookingPayload.interface';
import { SubjectType } from '../../models/subjecttypes.interface';
import { Service } from '../../models/services.interface';
import { ExistingSubject } from '../../models/existingSubject.interface';
import { CustomerAddress } from '../../models/customerAddress.interface';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  subjectTypes: SubjectType[] = [];
  allServices: Service[] = []; // Lưu trữ tất cả dịch vụ
  filteredServices: Service[] = []; // Dịch vụ đã lọc theo loại đối tượng
  customerAddresses: CustomerAddress[] = [];
  existingSubjects: ExistingSubject[] = [];


  selectedSubjectTypeId: number | string = ''; // Dùng string để option disabled hoạt động

  // Dữ liệu cho bảng SUBJECTS (nếu tạo mới)
  subjectData = {
    name: '',
    dateOfBirth: '',
    gender: undefined as number | undefined, // Hoặc null
    medicalNotes: '',
    imageUrl: '' // Nếu có
  };

  // Dữ liệu cho bảng BOOKINGS
  bookingData = {
    customerId: 0, // *** Cần lấy customerId của người dùng đang đăng nhập ***
    addressId: '' as number | string,
    serviceId: '' as number | string,
    scheduledStartTime: '',
    notes: '',
    subjectId: undefined as number | undefined // ID của subject nếu chọn từ danh sách đã có
  };


  processing = false;
  loadingServices = false;
  loadingSubjects = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private bookingService: BookingService, private authService: AuthService) { }

  ngOnInit(): void {
    // Lấy customerId từ AuthService
    const customerId = this.authService.getCustomerId();

    if (customerId !== undefined && customerId > 0) {
      this.bookingData.customerId = customerId;
      console.log("customerId obtained:", this.bookingData.customerId);
      this.loadInitialData(); // Tải dữ liệu ban đầu khi có customerId hợp lệ
    } else {
      console.error("Không lấy được customerId của người dùng đăng nhập hoặc customerId không hợp lệ.");
      this.errorMessage = "Không thể tải dữ liệu đặt lịch do thiếu thông tin người dùng.";
      // Đảm bảo các phần tử UI phụ thuộc vào dữ liệu ban đầu được ẩn hoặc disabled
    }
  }

  loadInitialData(): void {
    // Lấy danh sách loại đối tượng
    this.bookingService.getSubjectTypes().subscribe({
      next: (types) => this.subjectTypes = types,
      error: (err) => this.errorMessage = err.message
    });

    // Lấy danh sách TẤT CẢ dịch vụ (để lọc ở frontend)
    this.bookingService.getAllServices().subscribe({
      next: (services) => this.allServices = services,
      error: (err) => this.errorMessage = err.message
    });

    if (this.bookingData.customerId !== undefined && this.bookingData.customerId > 0) {
      this.bookingService.getCustomerAddresses(this.bookingData.customerId).subscribe({
        next: (addresses) => this.customerAddresses = addresses,
        error: (err) => this.errorMessage = err.message
      });
    } else {
      console.error("Cannot load customer addresses: customerId is not set or invalid.");
      // Thông báo lỗi đã hiển thị cho người dùng
    }
  }

  onSubjectTypeChange(typeId: number | string): void {
    this.filteredServices = []; // Xóa danh sách dịch vụ cũ
    this.existingSubjects = []; // Xóa danh sách subject cũ
    this.bookingData.serviceId = ''; // Reset lựa chọn dịch vụ
    this.bookingData.subjectId = undefined; // Reset lựa chọn subject đã có
    this.resetSubjectData(); // Reset form tạo subject mới

    if (typeId) {
      const numericTypeId = Number(typeId);
      // Lọc dịch vụ ở frontend
      this.filteredServices = this.allServices.filter(s => s.subjecttypeid === numericTypeId);

      // Lấy danh sách subject đã có của khách hàng cho loại này
      this.loadExistingSubjects(numericTypeId);

      // --- HOẶC: Gọi API để lấy dịch vụ đã lọc sẵn ---
      // this.loadingServices = true;
      // this.bookingService.getServicesBySubjectType(numericTypeId).subscribe({
      //   next: (services) => {
      //     this.filteredServices = services;
      //     this.loadingServices = false;
      //   },
      //   error: (err) => {
      //       this.errorMessage = err.message;
      //       this.loadingServices = false;
      //   }
      // });
    }
  }

  loadExistingSubjects(typeId: number): void {
    // Đảm bảo customerId và typeId hợp lệ trước khi gọi API
    if (this.bookingData.customerId !== undefined && this.bookingData.customerId > 0 && typeId) {
      this.loadingSubjects = true;
      this.bookingService.getExistingSubjects(this.bookingData.customerId, typeId).subscribe({
        next: (subjects) => {
          this.existingSubjects = subjects;
          this.loadingSubjects = false;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loadingSubjects = false;
        }
      });
    } else {
      console.warn("Không thể tải danh sách đối tượng đã có: customerId hoặc typeId không hợp lệ.");
    }
  }

  onExistingSubjectSelect(subjectId: number | string): void {
    if (subjectId) {
      this.bookingData.subjectId = Number(subjectId);
      // Xóa dữ liệu form tạo mới khi chọn subject đã có
      this.resetSubjectData();
    } else {
      this.bookingData.subjectId = undefined;
    }
  }


  onSubmit(): void {
    this.processing = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: BookingPayload = {
      customerid: this.bookingData.customerId,
      addressid: Number(this.bookingData.addressId),
      serviceid: Number(this.bookingData.serviceId),
      scheduledstarttime: new Date(this.bookingData.scheduledStartTime).toISOString(), // Chuyển sang ISO string
      notes: this.bookingData.notes
    };

    // Kiểm tra xem người dùng chọn subject đã có hay tạo mới
    if (this.bookingData.subjectId) {
      payload.subjectid = this.bookingData.subjectId;
    } else if (this.selectedSubjectTypeId) {
      // Chỉ gửi dữ liệu subject mới nếu người dùng không chọn subject đã có VÀ đã chọn loại subject
      payload.newSubjectData = {
        typeid: Number(this.selectedSubjectTypeId),
        name: this.subjectData.name,
        dateofbirth: this.subjectData.dateOfBirth || undefined, // Gửi undefined nếu rỗng
        gender: this.subjectData.gender,
        medicalnotes: this.subjectData.medicalNotes || undefined
        // imageUrl: this.subjectData.imageUrl || undefined
      };
    } else {
      this.errorMessage = "Vui lòng chọn loại đối tượng.";
      this.processing = false;
      return; // Không thực hiện submit nếu chưa chọn loại đối tượng
    }


    this.bookingService.createBooking(payload).subscribe({
      next: (response) => {
        this.successMessage = 'Đặt lịch thành công!';
        this.processing = false;
        // Reset form hoặc điều hướng người dùng
        // this.resetForm(bookingForm);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.processing = false;
      }
    });
  }

  resetSubjectData(): void {
    this.subjectData = {
      name: '',
      dateOfBirth: '',
      gender: undefined,
      medicalNotes: '',
      imageUrl: ''
    };
  }

  //Hàm reset form (ví dụ)
  resetForm(form: NgForm): void {
    form.resetForm();
    this.selectedSubjectTypeId = '';
    this.filteredServices = [];
    this.existingSubjects = [];
    this.resetSubjectData();
    this.bookingData = {
      customerId: 0, // *** Cần lấy customerId của người dùng đang đăng nhập ***
      addressId: '' as number | string,
      serviceId: '' as number | string,
      scheduledStartTime: '',
      notes: '',
      subjectId: undefined as number | undefined // ID của subject nếu chọn từ danh sách đã có
    }; // Reset booking data về giá trị ban đầu
  }
}
