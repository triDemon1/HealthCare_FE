import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent {
  appointments = [
    { name: 'Nguyễn Văn A', careType: 'elder', date: '2025-04-12', time: '10:00', note: 'Tới nhà' },
    { name: 'Trần Thị B', careType: 'child', date: '2025-04-13', time: '14:30', note: 'Tại trung tâm' }
  ];
}
