import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../../core/services/db-contact-service';
import { BoardTasksService } from '../../../../core/services/board-tasks-service';
import { TaskCardEdit } from '../task-card-edit/task-card-edit';
import { PriorityIcon } from '../../../../shared/components/priority-icon/priority-icon';

/**
 * Task card modal component for displaying detailed task information.
 * Handles task viewing, editing, deletion, subtask toggling, and contact management.
 */
@Component({
  selector: 'app-task-card-modal',
  imports: [CommonModule, TaskCardEdit, PriorityIcon],
  templateUrl: './task-card-modal.html',
  styleUrl: './task-card-modal.scss',
  standalone: true,
})
export class TaskCardModal implements OnInit, OnChanges {
  @Input() showModal = false;
  @Input() task: Task | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();

  private contactService = inject(ContactService);
  private taskService = inject(BoardTasksService);

  contacts: Contact[] = [];
  assignedContacts: Contact[] = [];
  showEditModal = false;

  showCategoryDropdown = false;
  showContactDropdown = false;

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads all contacts from the database.
   */
  async ngOnInit() {
    await this.loadContacts();
  }

  /**
   * Lifecycle hook that runs when input properties change.
   * Loads assigned contacts when task changes.
   */
  async ngOnChanges() {
    if (this.task) {
      await this.loadAssignedContacts();
    }
  }

  /**
   * Loads all contacts from the database.
   */
  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
  }

  /**
   * Loads contacts assigned to the current task.
   * Filters all contacts based on task's assignedTo array.
   */
  async loadAssignedContacts() {
    if (!this.task) return;
    this.assignedContacts = this.contacts.filter((c) => this.task!.assignedTo.includes(c.id!));
  }

  /**
   * Handles the Escape key press to close the modal.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showModal) {
      this.onClose();
    }
  }

  /**
   * Toggles the completion status of a subtask.
   * Updates the task in Firestore with the new subtask state.
   * 
   * @param subtaskId - The ID of the subtask to toggle
   */
  async toggleSubtask(subtaskId: string) {
    if (!this.task || !this.task.id) return;

    const subtask = this.task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    subtask.completed = !subtask.completed;

    await this.taskService.updateTask(this.task.id, {
      subtasks: this.task.subtasks,
    });
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
   * Gets the priority icon symbol for the current task.
   * 
   * @returns Symbol representing priority (↑ for urgent, = for medium, ↓ for low)
   */
  getPriorityIcon(): string {
    if (!this.task) return '=';
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
   * Gets the priority color for the current task.
   * 
   * @returns Hex color code based on task priority
   */
  getPriorityColor(): string {
    if (!this.task) return '#FFA800';
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

  /**
   * Gets the formatted priority text for the current task.
   * 
   * @returns Capitalized priority text (e.g., "Urgent", "Medium", "Low")
   */
  getPriorityText(): string {
    if (!this.task) return 'Medium';
    return this.task.priority.charAt(0).toUpperCase() + this.task.priority.slice(1);
  }

  /**
   * Formats a Firestore timestamp to a readable date string.
   * 
   * @param timestamp - Firestore timestamp to format
   * @returns Formatted date string in MM/DD/YYYY format
   */
  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Opens the edit modal for the current task.
   */
  onEdit() {
    if (this.task) {
      this.showEditModal = true;
    }
  }

  /**
   * Closes the edit modal.
   */
  closeEditModal() {
    this.showEditModal = false;
  }

  /**
   * Handles task update from the edit modal.
   * Updates local task data, reloads assigned contacts, and emits the updated task.
   * 
   * @param updatedTask - The updated task data
   */
  async handleTaskUpdated(updatedTask: Task) {
    this.task = { ...updatedTask };
    await this.loadAssignedContacts();
    this.editTask.emit(updatedTask);
  }

  /**
   * Handles task deletion.
   * Emits the task ID to be deleted.
   */
  async onDelete() {
    if (this.task && this.task.id) {
      this.deleteTask.emit(this.task.id);
    }
  }

  /**
   * Closes the modal and emits close event.
   */
  onClose() {
    this.closeModal.emit();
  }

  /**
   * Handles clicks on the modal overlay to close it.
   */
  onOverlayClick() {
    this.onClose();
  }

  /**
   * Handles clicks inside the modal content.
   * Closes dropdowns when clicking outside of them and prevents event propagation.
   * 
   * @param event - The mouse event
   */
  onModalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown-wrapper');
    if (!clickedInsideDropdown) {
      this.showCategoryDropdown = false;
      this.showContactDropdown = false;
    }
    event.stopPropagation();
  }

  /**
   * Changes close button image on hover.
   * 
   * @param imgElement - The close button image element
   */
  onCloseHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-hover-board.png';
  }

  /**
   * Restores close button image when hover ends.
   * 
   * @param imgElement - The close button image element
   */
  onCloseLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-default-board.png';
  }
}
