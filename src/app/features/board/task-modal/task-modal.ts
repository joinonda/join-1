import { Component, EventEmitter, Input, Output, OnInit, inject, HostListener } from '@angular/core';
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
  styleUrl: './task-modal.scss',
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
  priority: 'urgent' | 'medium' | 'low' = 'medium';
  category = '';
  selectedContactIds: string[] = [];
  subtasks: Subtask[] = [];
  newSubtaskTitle = '';
  editingSubtaskId: string | null = null;

  showCategoryDropdown = false;
  showContactDropdown = false;
  showSuccessToast = false;

  contacts: Contact[] = [];
  categories = ['Technical Task', 'User Story'];

  titleError = false;
  dueDateError = false;
  categoryError = false;

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showModal && !this.showCategoryDropdown && !this.showContactDropdown) {
      this.onClose();
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
    }
  }

  toggleContact(contactId: string) {
    const index = this.selectedContactIds.indexOf(contactId);
    if (index > -1) {
      this.selectedContactIds.splice(index, 1);
    } else {
      this.selectedContactIds.push(contactId);
    }
  }

  isContactSelected(contactId: string): boolean {
    return this.selectedContactIds.includes(contactId);
  }

  getSelectedContacts(): Contact[] {
    return this.contacts.filter((c) => this.selectedContactIds.includes(c.id!));
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.subtasks.push({
        id: Date.now().toString(),
        title: this.newSubtaskTitle.trim(),
        completed: false,
      });
      this.newSubtaskTitle = '';
    }
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
    '#FF7A00', '#9327FF', '#6E52FF', '#FC71FF', '#FFBB2B', '#1FD7C1',
    '#462F8A', '#FF4646', '#00BEE8', '#FF5EB3', '#FF745E', '#FFA35E',
    '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B',
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
      isValid = false;
    } else {
      this.dueDateError = false;
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
    const dueDateTimestamp = Timestamp.fromDate(new Date(this.dueDate));
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: this.title.trim(),
      description: this.description.trim(),
      dueDate: dueDateTimestamp,
      priority: this.priority,
      category: this.category,
      status: this.defaultStatus,
      assignedTo: this.selectedContactIds,
      subtasks: this.subtasks,
    };
    this.taskCreated.emit(newTask);
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.resetForm();
      this.closeModal.emit();
    }, 2000);
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
    this.titleError = false;
    this.dueDateError = false;
    this.categoryError = false;
    this.showCategoryDropdown = false;
    this.showContactDropdown = false;
  }

  onClose() {
    this.resetForm();
    this.closeModal.emit();
  }

  onOverlayClick() {
    this.onClose();
  }

  onModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
}