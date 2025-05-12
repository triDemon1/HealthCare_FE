import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderAdminDto } from '../../../../models/OrderAdminDto.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderManagementService } from '../../../../services/orderManagement.service';
import { OrderStatusDto } from '../../../../models/OrderStatus.interface';
import { AdminService } from '../../../../services/admin.service';
@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, FormsModule ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent {
  orderId: number | null = null;
  order: OrderAdminDto | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // Properties for updating status (Optional)
  selectedStatusId: number | null = null;
  orderStatuses: OrderStatusDto[] = []; // To hold possible statuses for a dropdown

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router for navigation back
    private adminService: AdminService,
    private orderManagementService: OrderManagementService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        this.orderId = +id; // Convert string ID to number
        this.loadOrderDetails(this.orderId);
        // Optional: Load order statuses if implementing status update dropdown
        this.loadOrderStatuses();
      } else {
        this.errorMessage = 'Không tìm thấy ID đơn hàng trên URL.';
        this.isLoading = false;
      }
    });
  }

  loadOrderDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderManagementService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.selectedStatusId = this.order.orderStatusId; // Set initial status for dropdown
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching order details:', err);
        this.errorMessage = 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại hoặc kiểm tra ID đơn hàng.';
        this.isLoading = false;
      }
    });
  }

  // Optional: Method to load possible order statuses for a dropdown
  loadOrderStatuses(): void {
    //You would need a service method to get all possible order statuses
    this.adminService.getAllOrderStatus().subscribe({
      next: (statuses) => {
        this.orderStatuses = statuses;
      },
      error: (err) => {
        console.error('Error fetching order statuses:', err);
        // Handle error
      }
    });
  }

  // Optional: Method to update order status
  updateOrderStatus(): void {
    if (this.orderId !== null && this.selectedStatusId !== null && this.order) {
      this.isLoading = true; // Show loading indicator during update
      this.orderManagementService.updateOrderStatus(this.orderId, this.selectedStatusId).subscribe({
        next: (updatedOrder) => {
          console.log('Order status updated successfully', updatedOrder);
          this.order = updatedOrder; // Update local order data with the response
          this.isLoading = false;
          // Optionally show a success message
        },
        error: (err) => {
          console.error('Error updating order status:', err);
          this.errorMessage = 'Cập nhật trạng thái đơn hàng thất bại. Vui lòng thử lại.';
          this.isLoading = false;
          // Reset selected status or handle error appropriately
          this.selectedStatusId = this.order?.orderStatusId || null; // Revert to original status on error
        }
      });
    }
  }

  // Method to navigate back to the order list
  goBack(): void {
    this.router.navigate(['/admin/orders']); // Adjust the route path if needed
  }
}
