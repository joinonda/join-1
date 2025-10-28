import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-columns',
  imports: [CommonModule, TaskCard, CdkDropList, CdkDrag],
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
  @Output() taskClicked = new EventEmitter<Task>();
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();

  isHovering = false;

  get addTaskIcon(): string {
    return this.isHovering ? 'assets/board/add-task-v2.png' : 'assets/board/add-task-v4.png';
  }

  onAddTaskClick() {
    this.addTaskClicked.emit(this.columnId);
  }

  onTaskClick(task: Task) {
    this.taskClicked.emit(task);
  }
}