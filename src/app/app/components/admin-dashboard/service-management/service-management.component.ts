import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Service } from '../../../models/services.interface';
import { ServiceManagement } from '../../../services/serviceManagement.service';
import { Pagination } from '../../../models/pagination.interface';
import { FormsModule } from '@angular/forms'; // For search input ngModel
import { BookingService } from '../../../services/booking.service';
@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.css']
})
export class ServiceManagementComponent implements OnInit {
  pagedServices: Pagination<Service> = {
    items: [],
    totalCount: 0,
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };
  isLoading = true;
  errorMessage: string | null = null;
  searchTerm: string = ''; // For search functionality

  // Dictionaries to map IDs to names for display
  serviceGroups: { [key: number]: string } = {};
  subjectTypes: { [key: number]: string } = {};

  constructor(private serviceManagement: ServiceManagement, public router: Router, private bookingService:BookingService) { }

  ngOnInit(): void {
    // Load lookup data first
    this.loadServiceGroups();
    this.loadSubjectTypes();
    this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm);
  }

  loadServiceGroups(): void {
    this.serviceManagement.getServiceGroups().subscribe({
      next: (data) => {
        this.serviceGroups = data.reduce((acc, group) => {
          acc[group.servicegroupid] = group.name;
          return acc;
        }, {} as { [key: number]: string });
      },
      error: (err) => console.error('Error loading service groups:', err)
    });
  }

  loadSubjectTypes(): void {
    this.bookingService.getSubjectTypes().subscribe({
      next: (data) => {
        this.subjectTypes = data.reduce((acc, type) => {
          acc[type.typeid] = type.subjectname;
          return acc;
        }, {} as { [key: number]: string });
      },
      error: (err) => console.error('Error loading subject types:', err)
    });
  }

  loadServices(pageIndex: number, pageSize: number, searchTerm: string = ''): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.bookingService.getAllServiceManagement(pageIndex, pageSize, searchTerm).subscribe({
      next: (data: Pagination<Service>) => {
        this.pagedServices = data;
        this.isLoading = false;
        console.log("Phản hồi data: ", data);
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.errorMessage = 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.pagedServices.pageIndex = 0; // Reset to first page on new search
    this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.pagedServices.totalPages) {
      this.pagedServices.pageIndex = page;
      this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm);
    }
  }

  nextPage(): void {
    if (this.pagedServices.hasNextPage) {
      this.pagedServices.pageIndex++;
      this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm);
    }
  }

  previousPage(): void {
    if (this.pagedServices.hasPreviousPage) {
      this.pagedServices.pageIndex--;
      this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm);
    }
  }

  // NEW: Navigate to the service edit form
  editService(serviceId: number | undefined): void {
    if (serviceId) {
      this.router.navigate(['/admin/services/edit', serviceId]);
    }
  }

  // NEW: Delete a service
  deleteService(serviceId: number | undefined): void {
    if (serviceId && confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      this.serviceManagement.deleteService(serviceId).subscribe({
        next: () => {
          alert('Dịch vụ đã được xóa thành công!');
          this.loadServices(this.pagedServices.pageIndex, this.pagedServices.pageSize, this.searchTerm); // Reload current page
        },
        error: (err) => {
          console.error('Lỗi khi xóa dịch vụ:', err);
          alert('Không thể xóa dịch vụ. Vui lòng thử lại.');
        }
      });
    }
  }

  // NEW: Navigate to the service add form
  createNewService(): void {
    this.router.navigate(['/admin/services/add']);
  }
}