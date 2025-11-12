import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Form fields component for editing task card details.
 * Handles title, description, and date inputs with validation and formatting.
 */
@Component({
  selector: 'app-task-card-edit-form-fields',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-card-edit-form-fields.html',
  styleUrl: './task-card-edit-form-fields.scss',
  standalone: true,
})
export class TaskCardEditFormFields {
  @Input() title = '';
  @Input() description = '';
  @Input() dueDate = '';
  @Input() hiddenDateValue = '';
  @Input() titleError = false;
  @Input() dueDateError = false;
  @Input() dueDateErrorMessage = 'This field is required';
  @Input() minDate = '';

  @Output() titleChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() dueDateChange = new EventEmitter<string>();
  @Output() hiddenDateValueChange = new EventEmitter<string>();
  @Output() titleErrorChange = new EventEmitter<boolean>();
  @Output() dueDateErrorChange = new EventEmitter<boolean>();
  @Output() dueDateErrorMessageChange = new EventEmitter<string>();

  @ViewChild('datePicker') datePicker!: ElementRef<HTMLInputElement>;

  /**
   * Handles title input changes.
   * Clears title error if present and emits the new value.
   * 
   * @param value - The new title value
   */
  onTitleChange(value: string) {
    this.title = value;
    this.titleChange.emit(value);
    if (this.titleError) {
      this.titleError = false;
      this.titleErrorChange.emit(false);
    }
  }

  /**
   * Handles description input changes and emits the new value.
   * 
   * @param value - The new description value
   */
  onDescriptionChange(value: string) {
    this.description = value;
    this.descriptionChange.emit(value);
  }

  /**
   * Formats date input as DD/MM/YYYY while typing.
   * Automatically adds slashes and validates when complete.
   * 
   * @param event - The input event
   */
  formatDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    value = this.addDateSlashes(value);

    this.dueDate = value;
    this.dueDateChange.emit(value);

    if (value.length === 10) {
      this.validateDate(value);
    }
  }

  /**
   * Adds slashes to date string at appropriate positions.
   * 
   * @param value - Numeric date string without formatting
   * @returns Formatted date string with slashes (DD/MM/YYYY)
   */
  private addDateSlashes(value: string): string {
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
    return value;
  }

  /**
   * Validates a date string in DD/MM/YYYY format.
   * Checks format validity and ensures date is not in the past.
   * 
   * @param dateString - Date string to validate in DD/MM/YYYY format
   */
  validateDate(dateString: string) {
    const [day, month, year] = dateString.split('/');

    if (this.isValidDateFormat(day, month, year)) {
      this.checkDateValidity(day, month, year);
    } else {
      this.setDateError('Invalid date format');
    }
  }

  /**
   * Checks if date parts have the correct format.
   * 
   * @param day - Day part (should be 2 digits)
   * @param month - Month part (should be 2 digits)
   * @param year - Year part (should be 4 digits)
   * @returns True if format is valid, false otherwise
   */
  private isValidDateFormat(day: string, month: string, year: string): boolean {
    return !!(day && month && year && day.length === 2 && month.length === 2 && year.length === 4);
  }

  /**
   * Checks if the date is valid and not in the past.
   * 
   * @param day - Day as string
   * @param month - Month as string
   * @param year - Year as string
   */
  private checkDateValidity(day: string, month: string, year: string): void {
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.setDateError('Date cannot be in the past');
    } else {
      this.clearDateError();
    }
  }

  /**
   * Sets a date validation error with the given message.
   * 
   * @param message - Error message to display
   */
  private setDateError(message: string): void {
    this.dueDateError = true;
    this.dueDateErrorMessage = message;
    this.dueDateErrorChange.emit(true);
    this.dueDateErrorMessageChange.emit(message);
  }

  /**
   * Clears any date validation errors.
   */
  private clearDateError(): void {
    this.dueDateError = false;
    this.dueDateErrorChange.emit(false);
  }

  /**
   * Opens the native date picker dialog.
   */
  openDatePicker() {
    this.datePicker.nativeElement.showPicker();
  }

  /**
   * Handles date selection from the native date picker.
   * Converts YYYY-MM-DD to DD/MM/YYYY format and clears errors.
   * 
   * @param event - The change event from the date picker
   */
  onDatePickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      this.updateDateFromPicker(dateValue);
      this.clearDateErrorIfNeeded();
    }
  }

  /**
   * Updates date values from the picker's YYYY-MM-DD format.
   * 
   * @param dateValue - Date value in YYYY-MM-DD format
   */
  private updateDateFromPicker(dateValue: string): void {
    const [year, month, day] = dateValue.split('-');
    this.dueDate = `${day}/${month}/${year}`;
    this.dueDateChange.emit(this.dueDate);
    this.hiddenDateValue = dateValue;
    this.hiddenDateValueChange.emit(dateValue);
  }

  /**
   * Clears date error if one exists.
   */
  private clearDateErrorIfNeeded(): void {
    if (this.dueDateError) {
      this.dueDateError = false;
      this.dueDateErrorChange.emit(false);
    }
  }
}
