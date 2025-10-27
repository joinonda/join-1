import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../core/services/db-contact-service';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  standalone: true,
})
export class TaskCard implements OnInit {
  @Input() task!: Task;

  private contactService = inject(ContactService);
  
  contacts: Contact[] = [];
  assignedContacts: Contact[] = [];

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
    // Filter nur die zugewiesenen Contacts
    this.assignedContacts = this.contacts.filter((c) => 
      this.task.assignedTo.includes(c.id!)
    );
  }

  /**
   * Berechnet die Anzahl der abgeschlossenen Subtasks
   */
  getCompletedSubtasks(): number {
    return this.task.subtasks.filter((s) => s.completed).length;
  }

  /**
   * Berechnet den Fortschritt in Prozent
   */
  getProgress(): number {
    if (this.task.subtasks.length === 0) return 0;
    return (this.getCompletedSubtasks() / this.task.subtasks.length) * 100;
  }

  /**
   * Gibt die Initialen eines Contacts zurück
   */
  getInitials(contact: Contact): string {
    if (!contact || !contact.firstname) return '';
    
    const nameParts = contact.firstname.trim().split(' ');
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Farbpalette für Avatare
   */
  colorPalette = [
    '#FF7A00', // Orange
    '#9327FF', // Purple
    '#6E52FF', // Blue
    '#FC71FF', // Pink
    '#FFBB2B', // Yellow
    '#1FD7C1', // Teal
    '#462F8A', // Dark Purple
    '#FF4646', // Red
    '#00BEE8', // Light Blue
    '#FF5EB3', // Light Pink
    '#FF745E', // Coral
    '#FFA35E', // Light Orange
    '#FFC701', // Bright Yellow
    '#0038FF', // Vivid Blue
    '#C3FF2B', // Lime Green
    '#FFE62B', // Bright Yellow
  ];

  /**
   * Generiert eine Farbe basierend auf der Contact-ID
   */
  getAvatarColor(contact: Contact): string {
    let hash = 0;
    const idString = String(contact.id);

    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  /**
   * Gibt das Priority-Icon zurück
   */
  getPriorityIcon(): string {
    switch (this.task.priority) {
      case 'urgent':
        return '↑';
      case 'medium':
        return '=';
      case 'low':
        return '↓';
      default:
        return '=';
    }
  }

  /**
   * Gibt die Priority-Farbe zurück
   */
  getPriorityColor(): string {
    switch (this.task.priority) {
      case 'urgent':
        return '#FF3D00';
      case 'medium':
        return '#FFA800';
      case 'low':
        return '#7AE229';
      default:
        return '#FFA800';
    }
  }
}