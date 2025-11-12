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

  /**
 * Validates the name input field and sets the error message if invalid.
 */
  validateName(): void {
    if (!this.nameTouched) return;

    this.nameError = '';

    if (!this.name.trim()) {
      this.nameError = 'Name is required';
      return;
    }
  }

  /**
 * Validates the email input field and sets the error message if invalid.
 */
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

  /**
 * Validates the password input field and sets the error message if invalid.
 */
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

  /**
 * Validates the password input field and sets the error message if invalid.
 */
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

  /**
 * Validates whether the privacy policy checkbox is checked.
 */
  validatePrivacyPolicy(): void {
    this.privacyPolicyError = '';
    if (!this.acceptPrivacyPolicy) {
      this.privacyPolicyError = 'Please accept the privacy policy';
      return;
    }
  }

  /**
 * Handles input changes for the name field and resets the error if necessary.
 */
  onNameInput(): void {
    this.nameTouched = true;
    if (this.nameError) {
      this.nameError = '';
    }
  }

  /**
 * Handles input changes for the email field and resets the error if necessary.
 */
  onEmailInput(): void {
    this.emailTouched = true;
    if (this.emailError) {
      this.emailError = '';
    }
  }

  /**
 * Handles input changes for the password field, resets the error, and updates the icon.
 */
  onPasswordInput(): void {
    this.passwordTouched = true;
    if (this.passwordError) {
      this.passwordError = '';
    }
    this.updatePasswordIcon();
  }

  /**
 * Handles input changes for the confirm password field, resets the error, and updates the icon.
 */
  onConfirmPasswordInput(): void {
    this.confirmPasswordTouched = true;
    if (this.confirmPasswordError) {
      this.confirmPasswordError = '';
    }
    this.updateConfirmPasswordIcon();
  }

  /**
 * Updates the password icon based on the current state and visibility.
 */
  updatePasswordIcon(): void {
    if (this.password.length === 0) {
      this.passwordIconSrc = 'assets/signup/lock-signup.png';
    } else {
      this.passwordIconSrc = this.showPassword
        ? 'assets/signup/eye.png'
        : 'assets/signup/eye-crossed-signup.png';
    }
  }

  /**
 * Updates the confirm password icon based on the current state and visibility.
 */
  updateConfirmPasswordIcon(): void {
    if (this.confirmPassword.length === 0) {
      this.confirmPasswordIconSrc = 'assets/signup/lock-signup.png';
    } else {
      this.confirmPasswordIconSrc = this.showConfirmPassword
        ? 'assets/signup/eye.png'
        : 'assets/signup/eye-crossed-signup.png';
    }
  }

  /**
 * Handles the sign-up process, including validation and registration.
 */
  async onSignUp() {
    this.markAllFieldsAsTouched();
    this.validateAllFields();
    if (this.hasValidationErrors()) return;
    this.isLoading = true;
    const result = await this.authService.register(this.getRegistrationData());
    this.isLoading = false;
    this.handleRegistrationResult(result);
  }

  /**
 * Marks all input fields as touched to trigger validation.
 */
  private markAllFieldsAsTouched(): void {
    this.nameTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;
  }

  /**
 * Validates all input fields and the privacy policy checkbox.
 */
  private validateAllFields(): void {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validatePrivacyPolicy();
  }

  /**
 * Checks if any validation errors are present.
 *
 * @returns True if there are validation errors, otherwise false.
 */
  private hasValidationErrors(): boolean {
    return !!(
      this.nameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmPasswordError ||
      this.privacyPolicyError
    );
  }

  /**
 * Constructs the registration data object from the form fields.
 *
 * @returns The registration data object.
 */
  private getRegistrationData() {
    return {
      email: this.email,
      name: this.name,
      password: this.password,
      confirmPassword: this.confirmPassword,
      acceptPrivacyPolicy: this.acceptPrivacyPolicy,
    };
  }

  /**
 * Handles the result of the registration process, showing a success message or logging an error.
 *
 * @param result - The result object from the registration attempt.
 */
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

  /**
 * Navigates back to the login page.
 */
  goBackToLogin() {
    this.router.navigate(['/login']);
  }

  /**
 * Handles hover state for the privacy policy checkbox and updates the image accordingly.
 *
 * @param isHovering - Whether the checkbox is being hovered.
 */
  onCheckboxHover(isHovering: boolean) {
    if (this.acceptPrivacyPolicy) {
      this.checkboxImageSrc = this.getCheckedHoverImage(isHovering);
    } else {
      this.checkboxImageSrc = this.getUncheckedHoverImage(isHovering);
    }
  }

  /**
 * Returns the image path for the checked checkbox based on hover state.
 *
 * @param isHovering - Whether the checkbox is being hovered.
 * @returns The image path.
 */
  private getCheckedHoverImage(isHovering: boolean): string {
    return isHovering
      ? 'assets/check-box/checkbox-checked-hovered.png'
      : 'assets/check-box/check-box-checked.png';
  }

  /**
 * Returns the image path for the unchecked checkbox based on hover state.
 *
 * @param isHovering - Whether the checkbox is being hovered.
 * @returns The image path.
 */
  private getUncheckedHoverImage(isHovering: boolean): string {
    return isHovering ? 'assets/check-box/check-box-hovered.png' : 'assets/check-box/check-box.png';
  }

  /**
 * Handles changes to the privacy policy checkbox and updates the image.
 */
  onCheckboxChange() {
    this.checkboxImageSrc = this.acceptPrivacyPolicy
      ? 'assets/check-box/check-box-checked.png'
      : 'assets/check-box/check-box.png';
    if (this.privacyPolicyError) {
      this.privacyPolicyError = '';
    }
  }

  /**
 * Handles hover state for the password icon and updates the icon accordingly.
 *
 * @param isHovering - Whether the icon is being hovered.
 */
  onPasswordIconHover(isHovering: boolean): void {
    if (this.password.length === 0) return;
    this.passwordIconSrc = this.getPasswordIconForHover(isHovering, this.showPassword);
  }

  /**
 * Handles hover state for the confirm password icon and updates the icon accordingly.
 *
 * @param isHovering - Whether the icon is being hovered.
 */
  onConfirmPasswordIconHover(isHovering: boolean): void {
    if (this.confirmPassword.length === 0) return;
    this.confirmPasswordIconSrc = this.getPasswordIconForHover(
      isHovering,
      this.showConfirmPassword
    );
  }

    /**
 * Returns the appropriate password icon path based on hover and visibility state.
 *
 * @param isHovering - Whether the icon is being hovered.
 * @param isVisible - Whether the password is visible.
 * @returns The icon path.
 */
  private getPasswordIconForHover(isHovering: boolean, isVisible: boolean): string {
    if (isHovering) {
      return isVisible ? 'assets/signup/eye-crossed-signup.png' : 'assets/signup/eye.png';
    } else {
      return isVisible ? 'assets/signup/eye.png' : 'assets/signup/eye-crossed-signup.png';
    }
  }

  /**
 * Toggles the visibility of the password field and updates the icon.
 */
  togglePasswordVisibility(): void {
    if (this.password.length === 0) return;
    this.showPassword = !this.showPassword;
    this.updatePasswordIcon();
  }

/**
 * Toggles the visibility of the confirm password field and updates the icon.
 */
  toggleConfirmPasswordVisibility(): void {
    if (this.confirmPassword.length === 0) return;
    this.showConfirmPassword = !this.showConfirmPassword;
    this.updateConfirmPasswordIcon();
  }
}
