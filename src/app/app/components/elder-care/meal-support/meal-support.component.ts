import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-meal-support',
  imports: [CommonModule,FormsModule],
  templateUrl: './meal-support.component.html',
  styleUrl: './meal-support.component.css'
})
export class MealSupportComponent {
  userInput: string = '';
  messages: { role: string, content: string }[] = [];
  constructor(private http: HttpClient, private router: Router) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = { role: 'user', content: this.userInput };
    this.messages.push(userMessage);

    this.http.post<any>('https://localhost:7064/api/ChatBot', { message: this.userInput })
      .subscribe({
        next: res => {
          const reply = res.reply || 'Xin lỗi, tôi chưa hiểu câu hỏi.';
          this.messages.push({ role: 'bot', content: reply });
        },
        error: err => {
          this.messages.push({ role: 'bot', content: 'Lỗi khi gửi tin nhắn. Vui lòng thử lại.' });
          console.error(err);
        }
      });

    this.userInput = '';
  }
  showAlert() {
    alert('Nút đã được click!');
  }
  goToBooking() {
    this.router.navigate(['/booking']); // <-- Sử dụng router.navigate
  }
}
export const mealSupportRoutes: Routes = [
  {
    path: '',
    component: MealSupportComponent
  }
];