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

  async ngOnInit() {}

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (
      this.formFieldsComponent?.showCategoryDropdown ||
      this.formFieldsComponent?.showContactDropdown
    ) {
      this.formFieldsComponent.closeDropdowns();
      return;
    }

    if (this.showModal && !this.showSuccessToast) {
      this.onClose();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown-wrapper');

    if (!clickedInsideDropdown && this.formFieldsComponent) {
      this.formFieldsComponent.closeDropdowns();
    }
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.title.trim()) {
      this.titleError = true;
      if (this.formFieldsComponent) {
        this.formFieldsComponent.titleError = true;
      }
      isValid = false;
    } else {
      this.titleError = false;
      if (this.formFieldsComponent) {
        this.formFieldsComponent.titleError = false;
      }
    }

    if (!this.dueDate) {
      this.dueDateError = true;
      this.dueDateErrorMessage = 'This field is required';
      if (this.formFieldsComponent) {
        this.formFieldsComponent.dueDateError = true;
        this.formFieldsComponent.dueDateErrorMessage = 'This field is required';
      }
      isValid = false;
    } else {
      const [day, month, year] = this.dueDate.split('/');
      if (day && month && year) {
        const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          this.dueDateError = true;
          this.dueDateErrorMessage = 'Date cannot be in the past';
          if (this.formFieldsComponent) {
            this.formFieldsComponent.dueDateError = true;
            this.formFieldsComponent.dueDateErrorMessage = 'Date cannot be in the past';
          }
          isValid = false;
        } else {
          this.dueDateError = false;
          if (this.formFieldsComponent) {
            this.formFieldsComponent.dueDateError = false;
          }
        }
      } else {
        this.dueDateError = true;
        this.dueDateErrorMessage = 'Invalid date format';
        if (this.formFieldsComponent) {
          this.formFieldsComponent.dueDateError = true;
          this.formFieldsComponent.dueDateErrorMessage = 'Invalid date format';
        }
        isValid = false;
      }
    }

    if (!this.category) {
      this.categoryError = true;
      if (this.formFieldsComponent) {
        this.formFieldsComponent.categoryError = true;
      }
      isValid = false;
    } else {
      this.categoryError = false;
      if (this.formFieldsComponent) {
        this.formFieldsComponent.categoryError = false;
      }
    }

    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const [day, month, year] = this.dueDate.split('/');
    const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dueDateTimestamp = Timestamp.fromDate(dateObject);

    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: this.title.trim(),
      description: this.description.trim(),
      dueDate: dueDateTimestamp,
      priority: this.priority,
      category: this.category,
      status: this.defaultStatus,
      assignedTo: [...this.selectedContactIds],
      subtasks: this.subtasks,
    };

    this.taskCreated.emit(newTask);
    this.showSuccessToast = true;

    setTimeout(() => {
      this.showSuccessToast = false;
      this.resetForm();
      this.closeModal.emit();
    }, 1500);
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 'medium';
    this.category = '';
    this.selectedContactIds = [];
    this.subtasks = [];
    this.titleError = false;
    this.dueDateError = false;
    this.dueDateErrorMessage = 'This field is required';
    this.categoryError = false;
  }

  onClose() {
    this.resetForm();
    this.closeModal.emit();
  }

  onOverlayClick() {
    if (!this.showSuccessToast) {
      this.onClose();
    }
  }

  onModalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.dropdown-wrapper');

    if (!clickedInsideDropdown && this.formFieldsComponent) {
      this.formFieldsComponent.closeDropdowns();
    }

    event.stopPropagation();
  }

  onSubtaskCloseHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-hover-board.png';
  }

  onSubtaskCloseLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-default-board.png';
  }
}
