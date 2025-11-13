import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './shared/components/header/header';
import { Navbar } from './shared/components/navbar/navbar';
import { ContactService } from './core/services/db-contact-service';
import { Contact } from './core/interfaces/db-contact-interface';
import { filter } from 'rxjs/operators';
import { BoardTasksService } from './core/services/board-tasks-service';
import { Task } from './core/interfaces/board-tasks-interface';

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

  contacts: Contact[] = [];
  tasks: Task[] = [];
  showNavigation = false;
  private hasReloaded = false;
  private contactService = inject(ContactService);
  private boardTasksService = inject(BoardTasksService);
  private router = inject(Router);


  /**
 * Lifecycle hook that runs on component initialization.
 * Checks the current route, loads contacts, and subscribes to route changes.
 */
async ngOnInit() {
  this.setupRouteHandling();
  await this.checkFirebaseHealthAndReload();
  this.loadContacts();
}

/**
 * Sets up router event handling and checks the initial route.
 */
private setupRouteHandling() {
  this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.checkRoute(event.url);
    });
  this.checkRoute(this.router.url);
}

/**
 * Checks Firebase connection health and triggers a reload if necessary.
 */
private async checkFirebaseHealthAndReload() {
  if (sessionStorage.getItem('hasReloaded')) {
    this.hasReloaded = true;
  }
  const isConnected = await this.performHealthCheck();
  if (!isConnected && !this.hasReloaded) {
    this.triggerReload();
  }
}

/**
 * Performs a Firebase health check with a 2-second timeout.
 * 
 * @returns True if Firebase is reachable, false otherwise.
 */
private async performHealthCheck(): Promise<boolean> {
  const healthCheckPromise = this.boardTasksService.checkFirebaseConnection();
  const timeoutPromise = new Promise<boolean>((resolve) => 
    setTimeout(() => resolve(false), 2000)
  );
  return await Promise.race([healthCheckPromise, timeoutPromise]);
}

/**
 * Triggers a page reload after marking it in session storage.
 */
private triggerReload() {
  console.error('Firebase not reachable, reloading once...');
  sessionStorage.setItem('hasReloaded', 'true');
  setTimeout(() => {
    console.warn('Page must be reloaded');
    location.reload();
  }, 1000);
}

/**
 * Loads all contacts from the database.
 */
private loadContacts() {
  this.contactService.getAllContacts().then((contacts) => {
    this.contacts = contacts;
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