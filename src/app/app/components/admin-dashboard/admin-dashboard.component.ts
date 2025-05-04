import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router'; // Import Router
import { RouterModule, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  constructor(
    private authService: AuthService, // Inject AuthService
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) { // Giả định AuthService có hàm isAdmin()
      console.warn('Access denied. User is not an Admin.');
      this.router.navigate(['/']); // Chuyển hướng về trang chủ
      // Hoặc this.router.navigate(['/login']);
    }
  }
}
