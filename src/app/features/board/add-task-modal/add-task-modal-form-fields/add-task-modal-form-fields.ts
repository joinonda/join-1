import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../../core/services/db-contact-service';
import { Subtask } from '../../../../core/interfaces/board-tasks-interface';

@Component({
  selector: 'app-add-task-modal-form-fields',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task-modal-form-fields.html',
  styleUrl: './add-task-modal-form-fields.scss',
  standalone: true,
})
export class AddTaskModalFormFields implements OnInit {
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

  private contactService = inject(ContactService);

  hiddenDateValue = '';
  minDate = this.getTodayDateString();
  newSubtaskTitle = '';
  editingSubtaskId: string | null = null;
  subtaskInputFocused = false;

  showCategoryDropdown = false;
  showContactDropdown = false;

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

  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.priority = priority;
    this.priorityChange.emit(this.priority);
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
    this.categoryChange.emit(this.category);
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
    this.selectedContactIdsChange.emit(this.selectedContactIds);
  }

  isContactSelected(contactId: string): boolean {
    return this.selectedContactIds.includes(contactId);
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
      this.subtasksChange.emit(this.subtasks);

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
    this.subtasksChange.emit(this.subtasks);
  }

  deleteSubtask(subtaskId: string) {
    this.subtasks = this.subtasks.filter((s) => s.id !== subtaskId);
    this.subtasksChange.emit(this.subtasks);
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
    this.dueDateChange.emit(this.dueDate);
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
      this.dueDateChange.emit(this.dueDate);
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

  onTitleInput() {
    this.titleError = false;
    this.titleChange.emit(this.title);
  }

  onDescriptionChange() {
    this.descriptionChange.emit(this.description);
  }

  onDateChange() {
    this.dueDateError = false;
  }

  closeDropdowns() {
    this.showCategoryDropdown = false;
    this.showContactDropdown = false;
  }
}
