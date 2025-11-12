import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, Subtask } from '../../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../../core/services/db-contact-service';
import { BoardTasksService } from '../../../../core/services/board-tasks-service';
import { Timestamp } from '@angular/fire/firestore';
import { PrioritySelectorComponent } from '../../../../shared/components/priority-selector/priority-selector';
import { SubtaskManagerComponent } from '../../../../shared/components/subtask-manager/subtask-manager';
import { TaskCardEditFormFields } from './task-card-edit-form-fields/task-card-edit-form-fields';
import { ContactAssignmentDropdownComponent } from './contact-assignment-dropdown/contact-assignment-dropdown';

/**
 * Task card edit modal component for editing existing tasks.
 * Handles task form population, validation, and updates to Firestore.
 */
@Component({
  selector: 'app-task-card-edit',
  imports: [
    CommonModule,
    PrioritySelectorComponent,
    SubtaskManagerComponent,
    TaskCardEditFormFields,
    ContactAssignmentDropdownComponent,
  ],
  templateUrl: './task-card-edit.html',
  styleUrl: './task-card-edit.scss',
  standalone: true,
})
export class TaskCardEdit implements OnInit, OnChanges {
  @Input() showModal = false;
  @Input() task: Task | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  private contactService = inject(ContactService);
  private taskService = inject(BoardTasksService);

  title = '';
  description = '';
  dueDate = '';
  hiddenDateValue = '';
  minDate = this.getTodayDateString();
  priority: 'urgent' | 'medium' | 'low' = 'medium';
  selectedContactIds: string[] = [];
  subtasks: Subtask[] = [];
  contacts: Contact[] = [];
  titleError = false;
  dueDateError = false;
  dueDateErrorMessage = 'This field is required';
  isLoadingContacts = false;
  contactsLoaded = false;

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads all contacts from the database.
   */
  async ngOnInit() {
    await this.loadContacts();
  }

  /**
   * Lifecycle hook that runs when input properties change.
   * Populates form when modal opens with a task, resets when modal closes.
   * 
   * @param changes - Object containing all input property changes
   */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal']) {
      if (this.showModal && this.task) {
        await this.ensureContactsLoaded();
        this.populateForm();
      } else if (!this.showModal) {
        this.resetForm();
      }
    }
  }

  /**
   * Ensures contacts are loaded before populating the form.
   * Waits for ongoing loading operations to complete.
   */
  private async ensureContactsLoaded() {
    if (!this.contactsLoaded && !this.isLoadingContacts) {
      await this.loadContacts();
    }
    while (this.isLoadingContacts) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Loads all contacts from the database.
   * Prevents duplicate loading operations.
   */
  async loadContacts() {
    if (this.isLoadingContacts || this.contactsLoaded) return;
    this.isLoadingContacts = true;
    try {
      this.contacts = await this.contactService.getAllContacts();
      this.contactsLoaded = true;
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      this.isLoadingContacts = false;
    }
  }

  /**
   * Gets today's date as a string in YYYY-MM-DD format.
   * 
   * @returns Today's date string
   */
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Populates the form with task data.
   * Creates deep copies of arrays to prevent reference issues.
   */
  populateForm() {
    if (!this.task) return;
    this.title = this.task.title;
    this.description = this.task.description;
    this.priority = this.task.priority;
    this.selectedContactIds = this.task.assignedTo ? [...this.task.assignedTo] : [];
    this.subtasks = this.task.subtasks ? JSON.parse(JSON.stringify(this.task.subtasks)) : [];
    this.populateDueDate();
  }

  /**
   * Populates the due date fields from the task's Firestore timestamp.
   * Converts timestamp to DD/MM/YYYY format for display and YYYY-MM-DD for input.
   */
  private populateDueDate() {
    if (!this.task?.dueDate) return;
    const date = this.task.dueDate.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.dueDate = `${day}/${month}/${year}`;
    this.hiddenDateValue = `${year}-${month}-${day}`;
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
   * Validates all form fields.
   * 
   * @returns True if all fields are valid, false otherwise
   */
  validateForm(): boolean {
    const isTitleValid = this.validateTitle();
    const isDateValid = this.validateDueDate();
    return isTitleValid && isDateValid;
  }

  /**
   * Validates the title field.
   * 
   * @returns True if title is not empty, false otherwise
   */
  private validateTitle(): boolean {
    this.titleError = !this.title.trim();
    return !this.titleError;
  }

  /**
   * Validates the due date field.
   * 
   * @returns True if date is present and valid, false otherwise
   */
  private validateDueDate(): boolean {
    if (!this.dueDate) {
      this.dueDateError = true;
      this.dueDateErrorMessage = 'This field is required';
      return false;
    }
    return this.validateDateFormat();
  }

  /**
   * Validates the date format (DD/MM/YYYY).
   * 
   * @returns True if format is valid, false otherwise
   */
  private validateDateFormat(): boolean {
    const [day, month, year] = this.dueDate.split('/');
    if (!day || !month || !year) {
      this.dueDateError = true;
      this.dueDateErrorMessage = 'Invalid date format';
      return false;
    }
    return this.validateDateNotPast(day, month, year);
  }

  /**
   * Validates that the date is not in the past.
   * 
   * @param day - Day as string
   * @param month - Month as string
   * @param year - Year as string
   * @returns True if date is today or in the future, false otherwise
   */
  private validateDateNotPast(day: string, month: string, year: string): boolean {
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      this.dueDateError = true;
      this.dueDateErrorMessage = 'Date cannot be in the past';
      return false;
    }
    this.dueDateError = false;
    return true;
  }

  /**
   * Validates and submits the form.
   * Updates the task in Firestore and emits the updated task.
   */
  async onSubmit() {
    if (!this.validateForm() || !this.task?.id) return;
    const updates = this.buildTaskUpdates();
    try {
      await this.taskService.updateTask(this.task.id, updates);
      const updatedTask = this.buildUpdatedTask(updates);
      this.taskUpdated.emit(updatedTask);
      this.closeModal.emit();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  /**
   * Builds the complete updated task object.
   * 
   * @param updates - Partial task updates
   * @returns Complete updated task object
   */
  private buildUpdatedTask(updates: Partial<Task>): Task {
    return { ...this.task!, ...updates };
  }

  /**
   * Builds the task update object from form data.
   * 
   * @returns Partial task object with updated fields
   */
  private buildTaskUpdates(): Partial<Task> {
    const [day, month, year] = this.dueDate.split('/');
    return {
      title: this.title.trim(),
      description: this.description.trim(),
      dueDate: Timestamp.fromDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day))),
      priority: this.priority,
      assignedTo: [...this.selectedContactIds],
      subtasks: [...this.subtasks],
      updatedAt: Timestamp.now(),
    };
  }

  /**
   * Resets all form fields to their default values.
   */
  resetForm() {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.hiddenDateValue = '';
    this.priority = 'medium';
    this.selectedContactIds = [];
    this.subtasks = [];
    this.resetErrors();
  }

  /**
   * Resets all validation error states.
   */
  private resetErrors() {
    this.titleError = false;
    this.dueDateError = false;
    this.dueDateErrorMessage = 'This field is required';
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
   * Prevents click propagation on the modal content.
   * 
   * @param event - The mouse event to stop propagation on
   */
  onModalClick(event: MouseEvent) {
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
