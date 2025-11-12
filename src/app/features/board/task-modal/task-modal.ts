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
import { Contact } from '../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../core/services/db-contact-service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-modal.html',
  styleUrls: ['./task-modal.scss', './task-modal2.scss'],
  standalone: true,
})
export class TaskModal implements OnInit {
  @Input() showModal = false;
  @Input() defaultStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done' = 'todo';
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Omit<Task, 'id' | 'createdAt'>>();

  private contactService = inject(ContactService);

  title = '';
  description = '';
  dueDate = '';
  hiddenDateValue = '';
  minDate = this.getTodayDateString();
  priority: 'urgent' | 'medium' | 'low' = 'medium';
  category = '';
  selectedContactIds: string[] = [];
  subtasks: Subtask[] = [];
  newSubtaskTitle = '';
  editingSubtaskId: string | null = null;
  subtaskInputFocused = false;

  showCategoryDropdown = false;
  showContactDropdown = false;
  showSuccessToast = false;

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  contactSearchTerm = 'Select contacts to assign';
  categories = ['Technical Task', 'User Story'];

  titleError = false;
  dueDateError = false;
  dueDateErrorMessage = 'This field is required';
  categoryError = false;

  @ViewChild('datePicker') datePicker!: ElementRef<HTMLInputElement>;
  @ViewChild('subtasksList') subtasksList!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
    this.filteredContacts = [...this.contacts];
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showCategoryDropdown || this.showContactDropdown) {
      this.showCategoryDropdown = false;
      this.showContactDropdown = false;
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

    if (!clickedInsideDropdown && this.showContactDropdown) {
      this.showContactDropdown = false;
      this.contactSearchTerm = 'Select contacts to assign';
      this.filteredContacts = [...this.contacts];
    }

    if (!clickedInsideDropdown && this.showCategoryDropdown) {
      this.showCategoryDropdown = false;
    }
  }

  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.priority = priority;
  }

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
    if (this.showCategoryDropdown) {
      this.showContactDropdown = false;
    }
  }

  selectCategory(category: string) {
    this.category = category;
    this.categoryError = false;
    this.showCategoryDropdown = false;
  }

  toggleContactDropdown() {
    this.showContactDropdown = !this.showContactDropdown;
    if (this.showContactDropdown) {
      this.showCategoryDropdown = false;
    } else {
      this.contactSearchTerm = 'Select contacts to assign';
      this.filteredContacts = [...this.contacts];
    }
  }

  onContactInputFocus() {
    if (this.contactSearchTerm === 'Select contacts to assign') {
      this.contactSearchTerm = '';
    }
    this.showContactDropdown = true;
  }

  onContactInputBlur() {
    setTimeout(() => {
      if (this.contactSearchTerm.trim() === '') {
        this.contactSearchTerm = 'Select contacts to assign';
      }
    }, 200);
  }

  onContactSearch() {
    const searchTerm = this.contactSearchTerm.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter((contact) =>
        contact.firstname.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleContact(contactId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const index = this.selectedContactIds.indexOf(contactId);
    if (index > -1) {
      this.selectedContactIds.splice(index, 1);
    } else {
      this.selectedContactIds.push(contactId);
    }
  }

  isContactSelected(contactId: string): boolean {
    const isSelected = this.selectedContactIds.includes(contactId);
    return isSelected;
  }

  getSelectedContacts(): Contact[] {
    return this.contacts.filter((c) => this.selectedContactIds.includes(c.id!));
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.subtasks.unshift({
        id: Date.now().toString(),
        title: this.newSubtaskTitle.trim(),
        completed: false,
      });
      this.newSubtaskTitle = '';
      this.subtaskInputFocused = false;

      setTimeout(() => {
        if (this.subtasksList) {
          this.subtasksList.nativeElement.scrollTop = 0;
        }
      }, 0);
    }
  }

  clearSubtaskInput() {
    this.newSubtaskTitle = '';
    this.subtaskInputFocused = false;
  }

  onSubtaskInputBlur() {
    setTimeout(() => {
      if (!this.newSubtaskTitle) {
        this.subtaskInputFocused = false;
      }
    }, 200);
  }

  startEditSubtask(subtaskId: string) {
    this.editingSubtaskId = subtaskId;
  }

  saveSubtask(subtask: Subtask, newTitle: string) {
    if (newTitle.trim()) {
      subtask.title = newTitle.trim();
    }
    this.editingSubtaskId = null;
  }

  deleteSubtask(subtaskId: string) {
    this.subtasks = this.subtasks.filter((s) => s.id !== subtaskId);
  }

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
  }

  openDatePicker() {
    this.datePicker.nativeElement.showPicker();
  }

  onDatePickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      this.dueDate = `${day}/${month}/${year}`;
    }
  }

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

  getAvatarColor(contact: Contact): string {
    let hash = 0;
    const idString = String(contact.id);
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.title.trim()) {
      this.titleError = true;
      isValid = false;
    } else {
      this.titleError = false;
    }

    if (!this.dueDate) {
      this.dueDateError = true;
      this.dueDateErrorMessage = 'This field is required';
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
          isValid = false;
        } else {
          this.dueDateError = false;
        }
      } else {
        this.dueDateError = true;
        this.dueDateErrorMessage = 'Invalid date format';
        isValid = false;
      }
    }

    if (!this.category) {
      this.categoryError = true;
      isValid = false;
    } else {
      this.categoryError = false;
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
    this.newSubtaskTitle = '';
    this.contactSearchTerm = 'Select contacts to assign';
    this.titleError = false;
    this.dueDateError = false;
    this.dueDateErrorMessage = 'This field is required';
    this.categoryError = false;
    this.showCategoryDropdown = false;
    this.showContactDropdown = false;
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

    if (!clickedInsideDropdown) {
      this.showCategoryDropdown = false;
      this.showContactDropdown = false;
    }

    event.stopPropagation();
  }

  onArrowHover(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/arrow-up-variant2.png';
    } else {
      imgElement.src = 'assets/arrow-down-variant2.png';
    }
  }

  onArrowLeave(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/board/arrow-drop-up-transparent.png';
    } else {
      imgElement.src = 'assets/board/arrow-drop-down-transparent.png';
    }
  }

  onSubtaskCheckHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/check-dark-hover.png';
  }

  onSubtaskCheckLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/check-dark-default.png';
  }

  onSubtaskCloseHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-hover-board.png';
  }

  onSubtaskCloseLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-default-board.png';
  }
}
