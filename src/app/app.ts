import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './shared/components/header/header';
import { Navbar } from './shared/components/navbar/navbar';
import { ContactService } from './core/services/db-contact-service';
import { ContactHelper, Contact } from './core/interfaces/db-contact-interface';
import { filter } from 'rxjs/operators';
import { Subscription, timer } from 'rxjs';

/**
 * Root component of the application.
 * Handles navigation visibility based on current route and loads contacts on initialization.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  /** Array of all contacts loaded from the database */
  contacts: Contact[] = [];

  /** Controls visibility of header and navigation components */
  showNavigation = false;

  private contactService = inject(ContactService);
  private router = inject(Router);
  private firebaseTimeout: Subscription | null = null;

  /**
   * Lifecycle hook that runs on component initialization.
   * Checks the current route, loads contacts, and subscribes to route changes.
   */
   async ngOnInit() {
  this.checkRoute(this.router.url);
  this.startFirebaseTimeout();
  this.contactService.getAllContacts()
    .then((contacts) => {
      this.contacts = contacts;
      this.stopFirebaseTimeout();
    })
    .catch((error) => {
      // Wenn ein Fehler auftritt (z.B. Firestore offline), Seite neu laden
      console.error('Error loading contacts:', error);
      window.location.reload();
    });
  this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.checkRoute(event.url);
    });
}

  /**
   * Checks if the current route requires navigation components.
   * Hides navigation on authentication routes (login, signup, root).
   * 
   * @param url - The current route URL
   */
  private checkRoute(url: string) {
    const authRoutes = ['/', '/login', '/signup'];
    this.showNavigation = !authRoutes.includes(url);
  }

  /** Starts a timeout that reloads the page if no contacts are loaded within 4 seconds */
  private startFirebaseTimeout() {
    this.firebaseTimeout = timer(4000).subscribe(() => {
      if (!this.contacts || this.contacts.length === 0) {
        console.warn('No data from Firebase, reloading page...');
        window.location.reload();
      }
    });
  }

  /** Stops the Firebase data loading timeout */
  private stopFirebaseTimeout() {
    if (this.firebaseTimeout) {
      this.firebaseTimeout.unsubscribe();
      this.firebaseTimeout = null;
    }
  }
}
