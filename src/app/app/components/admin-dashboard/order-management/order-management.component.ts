import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { AdminService } from '../../../services/admin.service';
import { OrderAdminDto } from '../../../models/OrderAdminDto.interface';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { OrderManagementService } from '../../../services/orderManagement.service';
import { Pagination } from '../../../models/pagination.interface';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-order-management',
  imports: [CommonModule, DatePipe, RouterModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent {
  orders: OrderAdminDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination properties
  currentPage = 0; // Backend uses 0-based index
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50]; // Options for page size selector

  constructor(private orderManagementService: OrderManagementService) { } // Use the new service

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderManagementService.getAllOrders(this.currentPage, this.pageSize).subscribe({
      next: (data: Pagination<OrderAdminDto>) => { // Expect Pagination object
        this.orders = data.items;
        this.totalItems = data.totalCount;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.errorMessage = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  // Pagination methods
  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  // Method to handle page size change
  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when page size changes
    this.loadOrders();
  }

  // Optional: Method to view order details (already handled by routerLink in HTML, but you might need a method for a modal or other actions)
  viewOrder(orderId: number): void {
    // This method is mostly illustrative as the routerLink handles navigation.
    // If you were opening a modal or doing something else, you would implement it here.
    console.log('Viewing order with ID:', orderId);
    // Example: this.orderManagementService.getOrderById(orderId).subscribe(...)
  }

  // Optional: Example method to update order status (requires UI element in HTML, e.g., a dropdown or button)
  // This is just a basic example. You might need a confirmation dialog or more complex logic.
  updateOrderStatus(orderId: number, newStatusId: number): void {
    // You would get the newStatusId from a UI element (like a dropdown)
    this.orderManagementService.updateOrderStatus(orderId, newStatusId).subscribe({
      next: (updatedOrder) => {
        console.log('Order status updated', updatedOrder);
        // Refresh the list or update the specific order in the list
        // For a simple list, reloading the current page is often sufficient
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        // Handle error, show message to user (e.g., using a toast notification service)
        this.errorMessage = 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.'; // Basic error message
      }
    });
  }
}
