import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  constructor(private http: HttpClient, private router: Router) { }
  booking = {
    name: '',
    careType: '',
    date: '',
    time: '',
    note: ''
  };

  onSubmit() {
    this.http.post('https://localhost:7064/api/Booking/bookings', this.booking)
      .subscribe(() => {
        alert('Đặt lịch thành công!');
        this.booking = {
          name: '',
          careType: '',
          date: '',
          time: '',
          note: ''
        }
        this.router.navigate(['/appoiments'])
      });
  }
}
