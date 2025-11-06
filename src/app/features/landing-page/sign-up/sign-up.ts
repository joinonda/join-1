import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
  standalone: true,
})
export class SignUp {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptPrivacyPolicy = false;
  errorMessage = '';
  isLoading = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  async onSignUp() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (!this.acceptPrivacyPolicy) {
      this.errorMessage = 'Please accept the privacy policy';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const result = await this.authService.register({
      email: this.email,
      name: this.name,
      password: this.password,
      confirmPassword: this.confirmPassword,
      acceptPrivacyPolicy: this.acceptPrivacyPolicy
    });

    this.isLoading = false;

    if (result.success) {
      this.router.navigate(['/login']);
    } else {
      this.errorMessage = result.message;
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}