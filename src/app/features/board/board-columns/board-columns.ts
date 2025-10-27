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
  @Output() addTaskClicked = new EventEmitter<string>();

  onAddTaskClick() {
    this.addTaskClicked.emit(this.columnId);
  }
}