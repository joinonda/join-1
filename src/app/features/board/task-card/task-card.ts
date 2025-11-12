import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../core/services/db-contact-service';
import { PriorityIcon } from '../../../shared/components/priority-icon/priority-icon';

/**
 * Task card component that displays task information in a card format.
 * Shows task details, assigned contacts, subtasks progress, and category.
 * Supports subtask toggling and card click interactions.
 */
@Component({
  selector: 'app-task-card',
  imports: [CommonModule, PriorityIcon, FormsModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  standalone: true,
})
export class TaskCard implements OnInit, OnChanges {
  @Input() task!: Task;
  @Output() cardClicked = new EventEmitter<Task>();
  @Output() subtaskToggled = new EventEmitter<{ task: Task; subtask: any }>();

  private contactService = inject(ContactService);

  contacts: Contact[] = [];
  assignedContacts: Contact[] = [];
  showSubtasks = false;

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads all contacts from the database.
   */
  async ngOnInit() {
    await this.loadContacts();
  }

  /**
   * Lifecycle hook that runs when input properties change.
   * Reloads contacts if needed and updates assigned contacts list.
   * 
   * @param changes - Object containing all input property changes
   */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      if (this.contacts.length === 0) {
        await this.loadContacts();
      }

      this.updateAssignedContacts();
    }
  }

  /**
   * Updates the list of assigned contacts based on task's assignedTo array.
   * Filters all contacts to find those assigned to this task.
   */
  updateAssignedContacts() {
    if (!this.task || !this.task.assignedTo) {
      this.assignedContacts = [];
      return;
    }

    this.assignedContacts = this.contacts.filter((c) => this.task.assignedTo.includes(c.id!));
  }

   /**
   * Loads all contacts from the database and updates assigned contacts.
   */
  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
    this.assignedContacts = this.contacts.filter((c) => this.task.assignedTo.includes(c.id!));
  }

  /**
   * Gets the number of completed subtasks.
   * 
   * @returns Count of completed subtasks
   */
  get completedSubtasks(): number {
    if (!this.task.subtasks) return 0;
    return this.task.subtasks.filter((s) => s.completed).length;
  }

  /**
   * Calculates the completion percentage of subtasks.
   * 
   * @returns Percentage of completed subtasks (0-100)
   */
  get progressPercentage(): number {
    if (!this.task.subtasks || this.task.subtasks.length === 0) return 0;
    return (this.completedSubtasks / this.task.subtasks.length) * 100;
  }

  /**
   * Generates initials from a contact's firstname.
   * Returns first letter for single names, or first and last initial for multiple names.
   * 
   * @param contact - The contact to generate initials for
   * @returns Uppercase initials (1-2 characters), or empty string if no firstname
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

  colorPalette = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#FFBB2B',
    '#1FD7C1',
    '#462F8A',
    '#FF4646',
    '#00BEE8',
    '#FF5EB3',
    '#FF745E',
    '#FFA35E',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
  ];

  /**
   * Generates a consistent avatar color for a contact based on their ID.
   * Uses a hash function to map the ID to a color from the palette.
   * 
   * @param contact - The contact to generate a color for
   * @returns Hex color code from the color palette
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
   * Handles card click event.
   * Emits the task for detail view or editing.
   */
  onCardClick(): void {
    this.cardClicked.emit(this.task);
  }

  /**
   * Gets the color for the task category badge.
   * 
   * @returns Hex color code based on task category
   */
  getCategoryColor(): string {
    const categoryColors: { [key: string]: string } = {
      'User Story': '#0038FF',
      'Technical Task': '#1FD7C1',
    };
    return categoryColors[this.task.category] || '#0038FF';
  }

  /**
   * Toggles the visibility of the subtasks list.
   */
  toggleSubtasks(): void {
    this.showSubtasks = !this.showSubtasks;
  }

  /**
   * Toggles the completion status of a subtask.
   * Emits event to update the task in the backend.
   * 
   * @param subtask - The subtask to toggle
   */
  toggleSubtaskCompletion(subtask: any): void {
    subtask.completed = !subtask.completed;
    this.subtaskToggled.emit({ task: this.task, subtask });
  }
}
