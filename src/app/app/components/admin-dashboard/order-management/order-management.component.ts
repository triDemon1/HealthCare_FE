import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { AdminService } from '../../../services/admin.service';
import { OrderAdminDto } from '../../../models/OrderAdminDto.interface';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
@Component({
  selector: 'app-order-management',
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent {
  orders: OrderAdminDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.errorMessage = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
}
