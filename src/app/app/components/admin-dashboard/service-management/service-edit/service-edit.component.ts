import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../../../../models/services.interface';
import { ServiceGroup } from '../../../../models/serviceGroup.interface';
import { SubjectType } from '../../../../models/subjecttypes.interface';
import { BookingService } from '../../../../services/booking.service';
import { Observable, of, combineLatest } from 'rxjs'; // Import 'of' and 'combineLatest'
import { ServiceManagement } from '../../../../services/serviceManagement.service';
import { switchMap, startWith, tap } from 'rxjs/operators'; // Import operators
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceCreateDTO } from '../../../../models/ServiceCreateDto.interface';
import { ServiceUpdateDTO } from '../../../../models/ServiceUpdateDto.interface';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-edit.component.html',
  styleUrls: ['./service-edit.component.css']
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  serviceForm: FormGroup;
  isEditMode = false;
  serviceId: number | null = null;
  serviceGroups$: Observable<ServiceGroup[]>; // Observable for all service groups
  filteredServiceGroups$: Observable<ServiceGroup[]> = of([]); // Observable for filtered service groups
  subjectTypes$: Observable<SubjectType[]>; // Observable for subject types dropdown
  errorMessage: string | null = null;
   private destroy$ = new Subject<void>(); // Dùng để hủy đăng ký khi component bị hủy
  private isInitialLoad = true; // Cờ mới để chỉ ra việc tải lần đầu
  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService, // Use BookingService
    private route: ActivatedRoute,
    private router: Router,
    private serviceManagement: ServiceManagement
  ) {
    this.serviceForm = this.fb.group({
      subjecttypeid: ['', Validators.required], // Moved subjecttypeid up
      servicegroupid: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      duration: ['', [Validators.min(1)]], // Duration should be positive
      price: ['', [Validators.min(0)]], // Price should be non-negative
      isactive: [true] // Default to active
    });

    this.subjectTypes$ = this.bookingService.getSubjectTypes(); // Load subject types
    this.serviceGroups$ = this.serviceManagement.getServiceGroups(); // Load all service groups (will be filtered later)

    // Listen for changes in the subjecttypeid dropdown
    this.filteredServiceGroups$ = this.serviceForm.get('subjecttypeid')!.valueChanges.pipe(
      startWith(this.serviceForm.get('subjecttypeid')!.value), // Emit initial value
      tap(currentSubjectTypeId => {
        // Chỉ reset servicegroupid nếu:
        // 1. KHÔNG phải là lần tải ban đầu (isInitialLoad = false)
        // HOẶC
        // 2. subjectTypeId thay đổi về rỗng (người dùng xóa chọn)
        if (!this.isInitialLoad || (currentSubjectTypeId === '' && this.serviceForm.get('servicegroupid')?.value)) {
          this.serviceForm.get('servicegroupid')!.setValue('');
        }
      }), // Reset servicegroupid when subjecttypeid changes
      switchMap(subjectTypeId => {
        if (subjectTypeId) {
          return this.serviceManagement.getServiceGroupsBySubjectType(subjectTypeId).pipe(
            tap(groups => {
              console.log('Filtered groups for dropdown (inside switchMap):', groups);
              console.log('Form servicegroupid AFTER filtering (inside switchMap):', this.serviceForm.get('servicegroupid')?.value);
            })
          );
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$) 
    );
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.params['id'];
    if (this.serviceId) {
      this.isEditMode = true;
      this.isEditMode = true;
      // Đặt cờ này là true khi bắt đầu quá trình fetch và patch
      // để ngăn tap() reset servicegroupid
      this.isInitialLoad = true; 
      this.serviceManagement.getServiceById(this.serviceId).subscribe({
        next: (service: Service) => {
          // Patch existing service values into the form
          this.serviceForm.patchValue({
            servicegroupid: service.servicegroupid,
            subjecttypeid: service.subjecttypeid,
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
            isactive: service.isactive
          });
          // Trigger the service group filtering after patching the subject type
          this.serviceForm.get('subjecttypeid')!.updateValueAndValidity();
          this.isInitialLoad = false;
          console.log('Final form value after ngOnInit patch:', this.serviceForm.value);
        },
        error: (err) => {
          console.error('Error fetching service for edit:', err);
          this.errorMessage = 'Không thể tải thông tin dịch vụ. Vui lòng thử lại.';
          this.isInitialLoad = false;
        }
      });
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
  if (this.serviceForm.valid) {
    const formValue = this.serviceForm.value;

    if (this.isEditMode && this.serviceId) {
      const updatePayload: ServiceUpdateDTO = {
        ...formValue,
        serviceid: this.serviceId
      };
      this.serviceManagement.updateService(this.serviceId, updatePayload).subscribe({
        next: () => {
          alert('Dịch vụ đã được cập nhật thành công!');
          this.router.navigate(['/admin/services']);
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật dịch vụ:', err);
          this.errorMessage = 'Không thể cập nhật dịch vụ. Vui lòng thử lại.';
        }
      });
    } else {
      const createPayload: ServiceCreateDTO = formValue;
      this.serviceManagement.addService(createPayload).subscribe({
        next: () => {
          alert('Dịch vụ đã được thêm thành công!');
          this.router.navigate(['/admin/services']);
        },
        error: (err) => {
          console.error('Lỗi khi thêm dịch vụ:', err);
          this.errorMessage = 'Không thể thêm dịch vụ. Vui lòng thử lại.';
        }
      });
    }
  } else {
    this.serviceForm.markAllAsTouched();
    this.errorMessage = 'Vui lòng điền đầy đủ và hợp lệ các trường.';
  }
}

  onCancel(): void {
    this.router.navigate(['/admin/services']); // Navigate back to service list
  }
}