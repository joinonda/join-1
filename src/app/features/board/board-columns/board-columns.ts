import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-board-columns',
  imports: [CommonModule, TaskCard],
  templateUrl: './board-columns.html',
  styleUrl: './board-columns.scss',
  standalone: true,
})
export class BoardColumns {
  @Input() title: string = '';
  @Input() tasks: Task[] = [];
  @Input() columnId: string = '';
  @Input() showAddButton: boolean = true;
  @Output() addTaskClicked = new EventEmitter<string>();

  isHovering = false;

  get addTaskIcon(): string {
    return this.isHovering ? 'assets/board/add-task-v2.png' : 'assets/board/add-task-v4.png';
  }

  onAddTaskClick() {
    this.addTaskClicked.emit(this.columnId);
  }
}
