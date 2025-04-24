import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elder-care',
  imports: [CommonModule],
  templateUrl: './elder-care.component.html',
  styleUrl: './elder-care.component.css'
})
export class ElderCareComponent {
  bookService() {
    alert('Đặt lịch dịch vụ: Chăm sóc y tế tại nhà');
  }
}
