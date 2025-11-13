import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './shared/components/header/header';
import { Navbar } from './shared/components/navbar/navbar';
import { ContactService } from './core/services/db-contact-service';
import { ContactHelper, Contact } from './core/interfaces/db-contact-interface';
import { filter } from 'rxjs/operators';

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

  /**
   * Lifecycle hook that runs on component initialization.
   * Checks the current route, loads contacts, and subscribes to route changes.
   */
  async ngOnInit() {
    this.checkRoute(this.router.url);

    this.contactService.getAllContacts().then((contacts) => {
      this.contacts = contacts;
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
}
