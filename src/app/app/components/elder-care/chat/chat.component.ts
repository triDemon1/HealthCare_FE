import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
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
}
export const chatRoutes: Routes = [
  {
    path: '',
    component: ChatComponent
  }
];
