import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  rentalRequests = [
    { name: 'Nguyễn Văn A', type: 'Căn hộ', date: '01/04/2024', status: 'Đang chờ' },
    { name: 'Trần Thị B', type: 'Biệt thự', date: '02/04/2024', status: 'Đang chờ' },
    { name: 'Lê Văn C', type: 'Nhà phố', date: '03/04/2024', status: 'Đang chờ' }
  ];

  ngOnInit() {
    this.loadCharts();
  }

  loadCharts() {
    new Chart("revenueChart", {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Doanh thu",
          data: [12000, 15000, 18000, 20000, 25000, 34000],
          borderColor: "green",
          fill: false
        }]
      }
    });

    new Chart("requestsChart", {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Yêu cầu thuê",
          data: [10, 15, 8, 20, 30, 15],
          backgroundColor: "orange"
        }]
      }
    });
  }

  approveRequest(request: any) {
    request.status = "Đã duyệt";
  }

  rejectRequest(request: any) {
    request.status = "Đã từ chối";
  }
}
