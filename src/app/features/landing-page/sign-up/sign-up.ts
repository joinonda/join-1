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
  nameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  privacyPolicyError = '';
  isLoading = false;
  showSuccessMessage = false;
  checkboxImageSrc = 'assets/check-box/check-box.png';

  nameTouched = false;
  emailTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;

  showPassword = false;
  showConfirmPassword = false;

  passwordIconSrc = 'assets/signup/lock-signup.png';
  confirmPasswordIconSrc = 'assets/signup/lock-signup.png';

  private router = inject(Router);
  private authService = inject(AuthService);

  validateName(): void {
    if (!this.nameTouched) return;

    this.nameError = '';

    if (!this.name.trim()) {
      this.nameError = 'Name is required';
      return;
    }
  }

  validateEmail(): void {
    if (!this.emailTouched) return;

    this.emailError = '';

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.emailError = 'Please enter a valid email address';
      return;
    }
  }

  validatePassword(): void {
    if (!this.passwordTouched) return;

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

  validateConfirmPassword(): void {
    if (!this.confirmPasswordTouched) return;

    this.confirmPasswordError = '';

    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      return;
    }
  }

  validatePrivacyPolicy(): void {
    this.privacyPolicyError = '';

    if (!this.acceptPrivacyPolicy) {
      this.privacyPolicyError = 'Please accept the privacy policy';
      return;
    }
  }

  onNameInput(): void {
    this.nameTouched = true;
    if (this.nameError) {
      this.nameError = '';
    }
  }

  onEmailInput(): void {
    this.emailTouched = true;
    if (this.emailError) {
      this.emailError = '';
    }
  }

  onPasswordInput(): void {
    this.passwordTouched = true;
    if (this.passwordError) {
      this.passwordError = '';
    }
    this.updatePasswordIcon();
  }

  onConfirmPasswordInput(): void {
    this.confirmPasswordTouched = true;
    if (this.confirmPasswordError) {
      this.confirmPasswordError = '';
    }
    this.updateConfirmPasswordIcon();
  }

  updatePasswordIcon(): void {
    if (this.password.length === 0) {
      this.passwordIconSrc = 'assets/signup/lock-signup.png';
    } else {
      this.passwordIconSrc = this.showPassword
        ? 'assets/signup/eye.png'
        : 'assets/signup/eye-crossed-signup.png';
    }
  }

  updateConfirmPasswordIcon(): void {
    if (this.confirmPassword.length === 0) {
      this.confirmPasswordIconSrc = 'assets/signup/lock-signup.png';
    } else {
      this.confirmPasswordIconSrc = this.showConfirmPassword
        ? 'assets/signup/eye.png'
        : 'assets/signup/eye-crossed-signup.png';
    }
  }

  async onSignUp() {
    this.markAllFieldsAsTouched();
    this.validateAllFields();

    if (this.hasValidationErrors()) return;

    this.isLoading = true;
    const result = await this.authService.register(this.getRegistrationData());
    this.isLoading = false;

    this.handleRegistrationResult(result);
  }

  private markAllFieldsAsTouched(): void {
    this.nameTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
  }

  private validateAllFields(): void {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validatePrivacyPolicy();
  }

  private hasValidationErrors(): boolean {
    return !!(
      this.nameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmPasswordError ||
      this.privacyPolicyError
    );
  }

  private getRegistrationData() {
    return {
      email: this.email,
      name: this.name,
      password: this.password,
      confirmPassword: this.confirmPassword,
      acceptPrivacyPolicy: this.acceptPrivacyPolicy,
    };
  }

  private handleRegistrationResult(result: any): void {
    if (result.success) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      console.error('Registration failed:', result.message);
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }

  onCheckboxHover(isHovering: boolean) {
    if (this.acceptPrivacyPolicy) {
      this.checkboxImageSrc = this.getCheckedHoverImage(isHovering);
    } else {
      this.checkboxImageSrc = this.getUncheckedHoverImage(isHovering);
    }
  }

  private getCheckedHoverImage(isHovering: boolean): string {
    return isHovering
      ? 'assets/check-box/checkbox-checked-hovered.png'
      : 'assets/check-box/check-box-checked.png';
  }

  private getUncheckedHoverImage(isHovering: boolean): string {
    return isHovering ? 'assets/check-box/check-box-hovered.png' : 'assets/check-box/check-box.png';
  }

  onCheckboxChange() {
    this.checkboxImageSrc = this.acceptPrivacyPolicy
      ? 'assets/check-box/check-box-checked.png'
      : 'assets/check-box/check-box.png';

    if (this.privacyPolicyError) {
      this.privacyPolicyError = '';
    }
  }

  onPasswordIconHover(isHovering: boolean): void {
    if (this.password.length === 0) return;
    this.passwordIconSrc = this.getPasswordIconForHover(isHovering, this.showPassword);
  }

  onConfirmPasswordIconHover(isHovering: boolean): void {
    if (this.confirmPassword.length === 0) return;
    this.confirmPasswordIconSrc = this.getPasswordIconForHover(
      isHovering,
      this.showConfirmPassword
    );
  }

  private getPasswordIconForHover(isHovering: boolean, isVisible: boolean): string {
    if (isHovering) {
      return isVisible ? 'assets/signup/eye-crossed-signup.png' : 'assets/signup/eye.png';
    } else {
      return isVisible ? 'assets/signup/eye.png' : 'assets/signup/eye-crossed-signup.png';
    }
  }

  togglePasswordVisibility(): void {
    if (this.password.length === 0) return;

    this.showPassword = !this.showPassword;
    this.updatePasswordIcon();
  }

  toggleConfirmPasswordVisibility(): void {
    if (this.confirmPassword.length === 0) return;

    this.showConfirmPassword = !this.showConfirmPassword;
    this.updateConfirmPasswordIcon();
  }
}
