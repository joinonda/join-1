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

  async ngOnInit() {
    await this.loadContacts();
  }

  async ngOnChanges() {
    if (this.task) {
      await this.loadAssignedContacts();
    }
  }

  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
  }

  async loadAssignedContacts() {
    if (!this.task) return;
    this.assignedContacts = this.contacts.filter((c) => this.task!.assignedTo.includes(c.id!));
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showModal) {
      this.onClose();
    }
  }

  async toggleSubtask(subtaskId: string) {
    if (!this.task || !this.task.id) return;

    const subtask = this.task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    subtask.completed = !subtask.completed;

    await this.taskService.updateTask(this.task.id, {
      subtasks: this.task.subtasks,
    });
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

  getPriorityText(): string {
    if (!this.task) return 'Medium';
    return this.task.priority.charAt(0).toUpperCase() + this.task.priority.slice(1);
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  onEdit() {
    if (this.task) {
      this.showEditModal = true;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  async handleTaskUpdated(updatedTask: Task) {
    this.task = { ...updatedTask };
    await this.loadAssignedContacts();
    this.editTask.emit(updatedTask);
    this.closeEditModal();
  }

  async onDelete() {
    if (this.task && this.task.id) {
      this.deleteTask.emit(this.task.id);
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onOverlayClick() {
    this.onClose();
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

  onCloseHover(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-hover-board.png';
  }

  onCloseLeave(imgElement: HTMLImageElement) {
    imgElement.src = 'assets/board/close-default-board.png';
  }
}
