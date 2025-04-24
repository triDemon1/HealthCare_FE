import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './app/components/header/header.component';
import { FooterComponent } from './app/components/footer/footer.component';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { HomeComponent } from './app/components/home/home.component';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './app/components/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, 
    HeaderComponent, 
    FooterComponent, 
    SidebarComponent, 
    RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {
    // // Theo dõi đường dẫn URL để xác định có phải trang chủ hay không
    // this.router.events.subscribe(() => {
    //   this.isHomePage = this.router.url === '/';
    // });
  }
  isHomePage(): boolean{
    return this.router.url.includes('');
  }
  isLoginPage(): boolean {
    return this.router.url.includes('/login'); 
  }
  isRegisterPage(): boolean {
    return this.router.url.includes('/register'); 
  }

  isAdminPage(): boolean {
    return this.router.url.startsWith('/admin-dashboard'); // Nếu URL bắt đầu bằng `/admin`, ẩn header/sidebar
  }
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
