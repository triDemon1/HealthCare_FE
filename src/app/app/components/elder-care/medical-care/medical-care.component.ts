import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-medical-care',
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-care.component.html',
  styleUrls: ['./medical-care.component.css']
})
export class MedicalCareComponent {
  booking = {
    name: '',
    careType: 'Chăm sóc y tế tại nhà',
    date: '',
    time: '',
    note: ''
  };

  constructor(private http: HttpClient) {}

  bookService() {
    if (!this.booking.name || !this.booking.date || !this.booking.time) {
      alert('Vui lòng điền đầy đủ tên, ngày và giờ!');
      return;
    }

    this.http.post('https://localhost:5001/api/booking', this.booking)
      .subscribe(() => {
        alert('Đặt lịch thành công!');
        this.resetForm();
      });
  }

  resetForm() {
    this.booking = {
      name: '',
      careType: 'Chăm sóc y tế tại nhà',
      date: '',
      time: '',
      note: ''
    };
  }
}
// cau hinh route
export const medicalCareRoutes: Routes = [
  {
    path: '',
    component: MedicalCareComponent
  }
];