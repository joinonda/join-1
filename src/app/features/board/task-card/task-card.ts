import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { Contact } from '../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../core/services/db-contact-service';
import { PriorityIcon } from '../../../shared/components/priority-icon/priority-icon';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, PriorityIcon, FormsModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  standalone: true,
})
export class TaskCard implements OnInit, OnChanges {
  @Input() task!: Task;
  @Output() cardClicked = new EventEmitter<Task>();
  @Output() subtaskEdited = new EventEmitter<{ task: Task; subtask: any }>();
  @Output() subtaskDeleted = new EventEmitter<{ task: Task; subtask: any }>();

  private contactService = inject(ContactService);

  contacts: Contact[] = [];
  assignedContacts: Contact[] = [];
  hoveredSubtaskId: string | null = null;
  showSubtasks = false;
  editingSubtaskId: string | null = null;
  editingSubtaskTitle = '';

  async ngOnInit() {
    await this.loadContacts();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      if (this.contacts.length === 0) {
        await this.loadContacts();
      }
      
      this.updateAssignedContacts();
    }
  }

  updateAssignedContacts() {
    if (!this.task || !this.task.assignedTo) {
      this.assignedContacts = [];
      return;
    }

    this.assignedContacts = this.contacts.filter((c) =>
      this.task.assignedTo.includes(c.id!)
    );
  }

  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
    this.assignedContacts = this.contacts.filter((c) => this.task.assignedTo.includes(c.id!));
  }

  get completedSubtasks(): number {
    if (!this.task.subtasks) return 0;
    return this.task.subtasks.filter((s) => s.completed).length;
  }

  get progressPercentage(): number {
    if (!this.task.subtasks || this.task.subtasks.length === 0) return 0;
    return (this.completedSubtasks / this.task.subtasks.length) * 100;
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

  onCardClick(): void {
    this.cardClicked.emit(this.task);
  }

  getCategoryColor(): string {
    const categoryColors: { [key: string]: string } = {
      'User Story': '#0038FF',
      'Technical Task': '#1FD7C1',
    };
    return categoryColors[this.task.category] || '#0038FF';
  }

  onEditSubtask(subtask: any): void {
    this.editingSubtaskId = subtask.id;
    this.editingSubtaskTitle = subtask.title;
  }

  saveSubtaskEdit(subtask: any): void {
    if (this.editingSubtaskTitle.trim()) {
      subtask.title = this.editingSubtaskTitle.trim();
      this.subtaskEdited.emit({ task: this.task, subtask });
    }
    this.cancelSubtaskEdit();
  }

  cancelSubtaskEdit(): void {
    this.editingSubtaskId = null;
    this.editingSubtaskTitle = '';
  }

  onDeleteSubtask(subtask: any): void {
    this.subtaskDeleted.emit({ task: this.task, subtask });
  }

  isEditing(subtaskId: string): boolean {
    return this.editingSubtaskId === subtaskId;
  }
}