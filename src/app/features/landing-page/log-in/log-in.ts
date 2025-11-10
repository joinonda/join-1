import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Header } from "../../../shared/components/header/header";

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss',
  standalone: true,
})
export class LogIn {
  email = '';
  password = '';
  errorMessage = '';
  emailError = '';
  passwordError = '';
  isLoading = false;
  showWelcome = false;
  welcomeUserName = '';
  timeOfDay = 'morning';
  capsLockOn = false;


  private router = inject(Router);
  private authService = inject(AuthService);

  validateEmail(): void {
    this.emailError = '';


    if (!this.email) {
      this.emailError = 'Email is required';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }
  }

  validatePassword(): void {
    this.passwordError = '';


    if (!this.password) {
      this.passwordError = 'Password is required';
      return;
    }

    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }
  }

  /**
   *  Caps Lock Detection
   */
  onPasswordKeydown(event: KeyboardEvent): void {
    this.capsLockOn = event.getModifierState('CapsLock');
  }

  /**
   *  Caps Lock bei Blur zurücksetzen
   */
  onPasswordBlur(): void {
    this.validatePassword();

  }

  async onLogin() {
    this.validateEmail();
    this.validatePassword();
    if (this.emailError || this.passwordError) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const result = await this.authService.login({
      email: this.email,
      password: this.password,
    });
    this.isLoading = false;

    if (result.success) {
      if (window.innerWidth < 1025 && result.user?.name) {
        this.showWelcomeAnimation(result.user.name);
      } else {
        this.router.navigate(['/summary']);
      }
    } else {
      this.errorMessage = result.message;
      if (result.message.includes('email')) {
        this.emailError = 'Invalid email or password';
      } else if (result.message.includes('password')) {
        this.passwordError = 'Invalid email or password';
      }
    }
  }

  onGuestLogin() {
    this.isLoading = true;

    const guestUser = {
      id: 'guest',
      email: 'guest@join.com',
      name: 'Guest User',
      password: '',
      createdAt: new Date(),
    };
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    this.authService['currentUserSubject'].next(guestUser);
    setTimeout(() => {
      this.isLoading = false;
      if (window.innerWidth < 1025) {
        this.showWelcomeAnimation('Guest User');
      } else {
        this.router.navigate(['/summary']);
      }
    }, 300);
  }

  private showWelcomeAnimation(userName: string): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.timeOfDay = 'morning';
    } else if (hour < 18) {
      this.timeOfDay = 'afternoon';
    } else {
      this.timeOfDay = 'evening';
    }

    this.welcomeUserName = userName;
    this.showWelcome = true;
    setTimeout(() => {
      setTimeout(() => {
        this.router.navigate(['/summary']);
        this.showWelcome = false;
      }, 500);
    }, 2500);
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  onEmailInput(): void {
    if (this.emailError) {
      this.emailError = '';
    }
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onPasswordInput(): void {
    if (this.passwordError) {
      this.passwordError = '';
    }
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}
