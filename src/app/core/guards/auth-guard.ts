/**
 * Checks if the current user is authenticated.
 *
 * - Injects AuthService and Router instances.
 * - Reads the stored user from localStorage.
 * - Returns `true` if the user is logged in and a user is stored.
 * - If no user is stored, logs out the user.
 * - Navigates to the login page and returns `false` if authentication fails.
 */

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const savedUser = localStorage.getItem('currentUser');
  
  if (authService.isLoggedIn() && savedUser) {
    return true;
  }

  if (!savedUser) {
    authService.logout();
  }

  router.navigate(['/login']);
  return false;
};