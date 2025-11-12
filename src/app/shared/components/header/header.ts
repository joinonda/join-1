import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userSubscription?: Subscription;

  userInitials = 'G';
  userName = 'Guest';
  showDropdown = false;
  isLoggedIn = false; 

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user && user.name) {
        this.userName = user.name;
        this.userInitials = this.getInitials(user.name);
      } else {
        this.userName = 'Guest';
        this.userInitials = 'G';
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  getInitials(name: string): string {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return 'G';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  navigateToLegalNotice() {
    this.showDropdown = false;
    this.router.navigate(['/legal-notice']);
  }

  navigateToPrivacyPolicy() {
    this.showDropdown = false;
    this.router.navigate(['/privacy-policy']);
  }

  logout() {
    this.authService.logout();
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }

  navigateToHelp() {
    this.showDropdown = false;
    this.router.navigate(['/help']);
  }
}