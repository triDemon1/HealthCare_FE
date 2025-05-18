import { Component,  EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common'; // ✅ Thêm CommonModule
import { CartService } from '../../services/cart.service';
@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount$: Observable<number>;
  constructor(public authService: AuthService, private cartService: CartService, private router: Router) {
    this.cartItemCount$ = this.cartService.getTotalItems();
  }
  userName: string = '';
  ngOnInit(): void {
    // Không cần subscribe thủ công nếu dùng async pipe trong template
    // this.cartSubscription = this.cartService.getTotalItems().subscribe(count => {
    //   this.cartItemCount = count;
    // });
    this.userName = this.authService.getUserName() ?? '';
  }

  ngOnDestroy(): void {
    // Không cần unsubscribe nếu dùng async pipe
    // if (this.cartSubscription) {
    //   this.cartSubscription.unsubscribe();
    // }
  }

  isUser(): boolean {
    return this.authService.isUser(); // Gọi hàm từ AuthService
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout() {
    this.authService.logout();
  }
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}

