import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Subtask } from '../../../core/interfaces/board-tasks-interface';
import { ContactService } from '../../../core/services/db-contact-service';
import { Timestamp } from '@angular/fire/firestore';
import { AddTaskModalFormFields } from './add-task-modal-form-fields/add-task-modal-form-fields';

/**
 * Add task modal component for creating new tasks.
 * Handles form validation, task creation, and success feedback.
 */
@Component({
  selector: 'app-add-task-modal',
  imports: [CommonModule, FormsModule, AddTaskModalFormFields],
  templateUrl: './add-task-modal.html',
  styleUrl: './add-task-modal.scss',
  standalone: true,
})
export class AddTaskModal implements OnInit {
  @Input() showModal = false;
  @Input() defaultStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done' = 'todo';
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Omit<Task, 'id' | 'createdAt'>>();

  private contactService = inject(ContactService);

  title = '';
  description = '';
  dueDate = '';
  priority: 'urgent' | 'medium' | 'low' = 'medium';
  category = '';
  selectedContactIds: string[] = [];
  subtasks: Subtask[] = [];

  showSuccessToast = false;

  titleError = false;
  dueDateError = false;
  dueDateErrorMessage = 'This field is required';
  categoryError = false;

  @ViewChild(AddTaskModalFormFields) formFieldsComponent!: AddTaskModalFormFields;

  /**
   * Lifecycle hook that runs on component initialization.
   */
  async ngOnInit() {}

  /**
   * Handles the Escape key press.
   * Closes dropdowns if open, otherwise closes the modal if no success toast is showing.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.formFieldsComponent?.showCategoryDropdown) {
      this.formFieldsComponent.closeDropdowns();
      return;
    }

    if (this.showModal && !this.showSuccessToast) {
      this.onClose();
    }
  }

  /**
   * Handles document-level clicks to close dropdowns when clicking outside.
   *
   * @param event - The mouse event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown-wrapper');

    if (!clickedInsideDropdown && this.formFieldsComponent) {
      this.formFieldsComponent.closeDropdowns();
    }
  }

  /**
   * Validates all required form fields.
   * Delegates validation to specific field validators.
   *
   * @returns True if all validations pass, false otherwise
   */
  validateForm(): boolean {
    let isValid = true;

    isValid = this.validateTitle() && isValid;
    isValid = this.validateDueDate() && isValid;
    isValid = this.validateCategory() && isValid;

    return isValid;
  }

  /**
   * Validates the task title field.
   * Updates error states in both component and form fields.
   *
   * @returns True if title is not empty, false otherwise
   */
  private validateTitle(): boolean {
    const hasTitle = this.title.trim().length > 0;
    this.titleError = !hasTitle;
    if (this.formFieldsComponent) {
      this.formFieldsComponent.titleError = !hasTitle;
    }
    return hasTitle;
  }

  /**
   * Validates the due date field.
   * Checks for presence, format, and date validity.
   *
   * @returns True if date is valid and formatted correctly, false otherwise
   */
  private validateDueDate(): boolean {
    if (!this.dueDate) {
      this.setDueDateError('This field is required');
      return false;
    }

    const [day, month, year] = this.dueDate.split('/');
    if (!day || !month || !year) {
      this.setDueDateError('Invalid date format');
      return false;
    }

    return this.validateDateNotInPast(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  /**
   * Validates that the selected date is not in the past.
   * Compares against today's date with time normalized to midnight.
   *
   * @param year - The year value
   * @param month - The month value (0-indexed)
   * @param day - The day value
   * @returns True if date is today or in the future, false if in the past
   */
  private validateDateNotInPast(year: number, month: number, day: number): boolean {
    const selectedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.setDueDateError('Date cannot be in the past');
      return false;
    }

    this.dueDateError = false;
    if (this.formFieldsComponent) this.formFieldsComponent.dueDateError = false;
    return true;
  }

  /**
   * Sets the due date error state with a specific message.
   * Updates error states in both component and form fields.
   *
   * @param message - The error message to display
   */
  private setDueDateError(message: string): void {
    this.dueDateError = true;
    this.dueDateErrorMessage = message;
    if (this.formFieldsComponent) {
      this.formFieldsComponent.dueDateError = true;
      this.formFieldsComponent.dueDateErrorMessage = message;
    }
  }

  /**
   * Validates the category field.
   * Updates error states in both component and form fields.
   *
   * @returns True if category is selected, false otherwise
   */
  private validateCategory(): boolean {
    const hasCategory = !!this.category;
    this.categoryError = !hasCategory;
    if (this.formFieldsComponent) {
      this.formFieldsComponent.categoryError = !hasCategory;
    }
    return hasCategory;
  }

  /**
   * Validates and submits the form to create a new task.
   * Shows success toast and closes modal after creation.
   */
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const dueDateTimestamp = this.convertDueDateToTimestamp();
    const newTask = this.createTaskObject(dueDateTimestamp);

    this.taskCreated.emit(newTask);
    this.displaySuccessAndClose();
  }

  /**
   * Converts the due date string to a Firestore Timestamp.
   *
   * @returns The Firestore Timestamp for the due date
   */
  private convertDueDateToTimestamp(): Timestamp {
    const [day, month, year] = this.dueDate.split('/');
    const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return Timestamp.fromDate(dateObject);
  }

  /**
   * Creates the task object with all form data.
   *
   * @param dueDateTimestamp - The due date as a Firestore Timestamp
   * @returns The task object ready for creation
   */
  private createTaskObject(dueDateTimestamp: Timestamp): Omit<Task, 'id' | 'createdAt'> {
    return {
      title: this.title.trim(),
      description: this.description.trim(),
      dueDate: dueDateTimestamp,
      priority: this.priority,
      category: this.category,
      status: this.defaultStatus,
      assignedTo: [...this.selectedContactIds],
      subtasks: this.subtasks,
    };
  }

  /**
   * Displays success toast and closes modal after delay.
   */
  private displaySuccessAndClose(): void {
    this.showSuccessToast = true;

    setTimeout(() => {
      this.showSuccessToast = false;
      this.resetForm();
      this.closeModal.emit();
    }, 1500);
  }

  /**
   * Resets all form fields and error states to their default values.
   */
  resetForm() {
    this.resetFormFields();
    this.resetErrorStates();
  }

  /**
   * Resets all form field values to their defaults.
   */
  private resetFormFields(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 'medium';
    this.category = '';
    this.selectedContactIds = [];
    this.subtasks = [];
  }

  /**
   * Resets all error states to their defaults.
   */
  private resetErrorStates(): void {
    this.titleError = false;
    this.dueDateError = false;
    this.dueDateErrorMessage = 'This field is required';
    this.categoryError = false;
  }

  /**
   * Closes the modal and resets the form.
   */
  onClose() {
    this.resetForm();
    this.closeModal.emit();
  }

  /**
   * Handles clicks on the modal overlay.
   * Closes modal only if success toast is not showing.
   */
  onOverlayClick() {
    if (!this.showSuccessToast) {
      this.onClose();
    }
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

    if (!clickedInsideDropdown && this.formFieldsComponent) {
      this.formFieldsComponent.closeDropdowns();
    }

    event.stopPropagation();
  }

  /**
   * Changes subtask close button image on hover.
   *
   * @param imgElement - The close button image element
   */
  onSubtaskCloseHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-hover-board.png';
  }

  /**
   * Restores subtask close button image when hover ends.
   *
   * @param imgElement - The close button image element
   */
  onSubtaskCloseLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-default-board.png';
  }
}
