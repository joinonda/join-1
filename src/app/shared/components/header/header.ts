import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userInitials = 'G';
  userName = 'Guest';
  showDropdown = false;

  ngOnInit() {
    this.loadUserData();
  }

  /**
   * Lädt User-Daten und generiert Initialen
   */
  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.name) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  /**
   * Generiert Initialen aus Name (Vor- und Nachname)
   */
  getInitials(name: string): string {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      // Vor- und Nachname vorhanden
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      // Nur ein Name
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return 'G'; // Fallback
  }

  /**
   * Togglet Dropdown-Menü
   */
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  /**
   * Schließt Dropdown wenn außerhalb geklickt wird
   */
  closeDropdown() {
    this.showDropdown = false;
  }

  /**
   * Navigiert zu Legal Notice
   */
  navigateToLegalNotice() {
    this.showDropdown = false;
    this.router.navigate(['/legal-notice']);
  }

  /**
   * Navigiert zu Privacy Policy
   */
  navigateToPrivacyPolicy() {
    this.showDropdown = false;
    this.router.navigate(['/privacy-policy']);
  }

  /**
   * Logout
   */
  logout() {
    this.authService.logout();
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }
}