import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss',
  standalone: true,
})
export class LogIn {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const result = await this.authService.login({
      email: this.email,
      password: this.password
    });
    this.isLoading = false;
    if (result.success) {
      this.router.navigate(['/summary']);
    } else {
      this.errorMessage = result.message;
    }
  }

  onGuestLogin() {
    this.router.navigate(['/summary']);
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }
}