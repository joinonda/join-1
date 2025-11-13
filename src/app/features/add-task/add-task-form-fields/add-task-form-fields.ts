import {
  Component,
  OnInit,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subtask } from '../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../core/services/db-contact-service';
import { PrioritySelectorComponent } from '../../../shared/components/priority-selector/priority-selector';
import { SubtaskManagerComponent } from '../../../shared/components/subtask-manager/subtask-manager';
import { ContactAssignmentDropdownComponent } from '../../../shared/components/contact-assignment-dropdown/contact-assignment-dropdown';

/**
 * Form fields component for task creation.
 * Handles all form inputs, validation, and user interactions for task data.
 */
@Component({
  selector: 'app-add-task-form-fields',
  imports: [
    CommonModule,
    FormsModule,
    PrioritySelectorComponent,
    SubtaskManagerComponent,
    ContactAssignmentDropdownComponent,
  ],
  templateUrl: './add-task-form-fields.html',
  styleUrl: './add-task-form-fields.scss',
  standalone: true,
})
export class AddTaskFormFields implements OnInit {
  private contactService = inject(ContactService);

  @Input() title = '';
  @Input() description = '';
  @Input() dueDate = '';
  @Input() priority: 'urgent' | 'medium' | 'low' = 'medium';
  @Input() category = '';
  @Input() selectedContactIds: string[] = [];
  @Input() subtasks: Subtask[] = [];

  @Output() titleChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() dueDateChange = new EventEmitter<string>();
  @Output() priorityChange = new EventEmitter<'urgent' | 'medium' | 'low'>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() selectedContactIdsChange = new EventEmitter<string[]>();
  @Output() subtasksChange = new EventEmitter<Subtask[]>();

  hiddenDateValue = '';
  minDate = this.getTodayDateString();
  showCategoryDropdown = false;

  contacts: Contact[] = [];
  categories = ['Technical Task', 'User Story'];

  titleError = false;
  dueDateError = false;
  dueDateErrorMessage = 'This field is required';
  categoryError = false;

  @ViewChild('datePicker') datePicker!: ElementRef<HTMLInputElement>;

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads all contacts from the database.
   */
  async ngOnInit() {
    await this.loadContacts();
  }

  /**
   * Loads all contacts from the contact service.
   * Populates the contacts array for assignment dropdown.
   */
  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
  }

  /**
   * Handles the Escape key press.
   * Closes the category dropdown if open.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showCategoryDropdown) {
      this.showCategoryDropdown = false;
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

    if (!clickedInsideDropdown && this.showCategoryDropdown) {
      this.showCategoryDropdown = false;
    }
  }

  /**
   * Toggles the category dropdown visibility.
   * Opens dropdown if closed, closes if open.
   */
  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  /**
   * Selects a category and updates the form.
   * Emits change event, clears error, and closes dropdown.
   *
   * @param category - The selected category name
   */
  selectCategory(category: string) {
    this.category = category;
    this.categoryChange.emit(this.category);
    this.categoryError = false;
    this.showCategoryDropdown = false;
  }

  /**
   * Formats date input as user types in DD/MM/YYYY format.
   * Automatically adds slashes at appropriate positions.
   *
   * @param event - The input event from the date field
   */
  formatDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }

    this.dueDate = value;
    this.dueDateChange.emit(this.dueDate);
  }

  /**
   * Opens the native date picker dialog.
   * Triggers the browser's date selection interface.
   */
  openDatePicker() {
    this.datePicker.nativeElement.showPicker();
  }

  /**
   * Handles date selection from the native date picker.
   * Converts YYYY-MM-DD format to DD/MM/YYYY and updates form.
   *
   * @param event - The change event from the date picker
   */
  onDatePickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      this.dueDate = `${day}/${month}/${year}`;
      this.dueDateChange.emit(this.dueDate);
      this.dueDateError = false;
    }
  }

  /**
   * Gets today's date as a string in YYYY-MM-DD format.
   * Used to set the minimum date for the date picker.
   *
   * @returns Date string in YYYY-MM-DD format
   */
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handles title input changes.
   * Emits change event and clears error state.
   */
  onTitleChange() {
    this.titleChange.emit(this.title);
    this.titleError = false;
  }

  /**
   * Handles description input changes.
   * Emits change event to parent component.
   */
  onDescriptionChange() {
    this.descriptionChange.emit(this.description);
  }

  /**
   * Handles due date input changes.
   * Emits change event and clears error state.
   */
  onDueDateChange() {
    this.dueDateChange.emit(this.dueDate);
    this.dueDateError = false;
  }

  /**
   * Validates all form fields.
   * Checks title, due date, and category for completeness and validity.
   *
   * @returns True if all fields are valid, false otherwise
   */
  validateForm(): boolean {
    const isTitleValid = this.validateTitle();
    const isDueDateValid = this.validateDueDate();
    const isCategoryValid = this.validateCategory();

    return isTitleValid && isDueDateValid && isCategoryValid;
  }

  /**
   * Validates the title field.
   * Checks if title is not empty after trimming whitespace.
   *
   * @returns True if title is valid, false otherwise
   */
  private validateTitle(): boolean {
    if (!this.title.trim()) {
      this.titleError = true;
      return false;
    }
    this.titleError = false;
    return true;
  }

  /**
   * Validates the due date field.
   * Checks if date is present and delegates format validation.
   *
   * @returns True if date is valid, false otherwise
   */
  private validateDueDate(): boolean {
    if (!this.dueDate) {
      this.setDueDateError('This field is required');
      return false;
    }
    return this.validateDueDateFormat();
  }

  /**
   * Validates the due date format.
   * Checks if date follows DD/MM/YYYY pattern and validates against past dates.
   *
   * @returns True if format is valid and date is not in past, false otherwise
   */
  private validateDueDateFormat(): boolean {
    const [day, month, year] = this.dueDate.split('/');
    if (!day || !month || !year) {
      this.setDueDateError('Invalid date format');
      return false;
    }
    return this.checkDueDateNotInPast(day, month, year);
  }

  /**
   * Checks if the selected date is not in the past.
   * Compares against today's date with time normalized to midnight.
   *
   * @param day - The day value as string
   * @param month - The month value as string
   * @param year - The year value as string
   * @returns True if date is today or in future, false if in past
   */
  private checkDueDateNotInPast(day: string, month: string, year: string): boolean {
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.setDueDateError('Date cannot be in the past');
      return false;
    }
    this.dueDateError = false;
    return true;
  }

  /**
   * Sets the due date error state with a specific message.
   * Updates both error flag and error message.
   *
   * @param message - The error message to display
   */
  private setDueDateError(message: string): void {
    this.dueDateError = true;
    this.dueDateErrorMessage = message;
  }

  /**
   * Validates the category field.
   * Checks if a category has been selected.
   *
   * @returns True if category is selected, false otherwise
   */
  private validateCategory(): boolean {
    if (!this.category) {
      this.categoryError = true;
      return false;
    }
    this.categoryError = false;
    return true;
  }

  /**
   * Resets all form fields, errors, and emits changes.
   * Orchestrates the complete form reset process.
   */
  resetForm() {
    this.resetFormFields();
    this.resetFormErrors();
    this.emitFormChanges();
  }

  /**
   * Resets all form field values to their defaults.
   * Clears title, description, date, priority, category, contacts, and subtasks.
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
   * Resets all form error states to their defaults.
   * Clears all error flags, messages, and closes dropdowns.
   */
  private resetFormErrors(): void {
    this.titleError = false;
    this.dueDateError = false;
    this.dueDateErrorMessage = 'This field is required';
    this.categoryError = false;
    this.showCategoryDropdown = false;
  }

  /**
   * Emits all form field changes to parent component.
   * Notifies parent of all reset values.
   */
  private emitFormChanges(): void {
    this.titleChange.emit(this.title);
    this.descriptionChange.emit(this.description);
    this.dueDateChange.emit(this.dueDate);
    this.priorityChange.emit(this.priority);
    this.categoryChange.emit(this.category);
    this.selectedContactIdsChange.emit(this.selectedContactIds);
    this.subtasksChange.emit(this.subtasks);
  }
}
