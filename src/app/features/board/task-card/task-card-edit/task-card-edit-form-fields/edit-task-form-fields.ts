import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-task-form-fields',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task-form-fields.html',
  styleUrl: './edit-task-form-fields.scss',
  standalone: true,
})
export class EditTaskFormFieldsComponent {
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

  onTitleChange(value: string) {
    this.title = value;
    this.titleChange.emit(value);
    if (this.titleError) {
      this.titleError = false;
      this.titleErrorChange.emit(false);
    }
  }

  onDescriptionChange(value: string) {
    this.description = value;
    this.descriptionChange.emit(value);
  }

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

  private addDateSlashes(value: string): string {
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
    return value;
  }

  validateDate(dateString: string) {
    const [day, month, year] = dateString.split('/');

    if (this.isValidDateFormat(day, month, year)) {
      this.checkDateValidity(day, month, year);
    } else {
      this.setDateError('Invalid date format');
    }
  }

  private isValidDateFormat(day: string, month: string, year: string): boolean {
    return !!(day && month && year && day.length === 2 && month.length === 2 && year.length === 4);
  }

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

  private setDateError(message: string): void {
    this.dueDateError = true;
    this.dueDateErrorMessage = message;
    this.dueDateErrorChange.emit(true);
    this.dueDateErrorMessageChange.emit(message);
  }

  private clearDateError(): void {
    this.dueDateError = false;
    this.dueDateErrorChange.emit(false);
  }

  openDatePicker() {
    this.datePicker.nativeElement.showPicker();
  }

  onDatePickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      this.updateDateFromPicker(dateValue);
      this.clearDateErrorIfNeeded();
    }
  }

  private updateDateFromPicker(dateValue: string): void {
    const [year, month, day] = dateValue.split('-');
    this.dueDate = `${day}/${month}/${year}`;
    this.dueDateChange.emit(this.dueDate);
    this.hiddenDateValue = dateValue;
    this.hiddenDateValueChange.emit(dateValue);
  }

  private clearDateErrorIfNeeded(): void {
    if (this.dueDateError) {
      this.dueDateError = false;
      this.dueDateErrorChange.emit(false);
    }
  }
}
