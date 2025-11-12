import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardTasksService } from '../../../core/services/board-tasks-service';
import { Firestore, writeBatch, doc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-columns',
  imports: [CommonModule, TaskCard, CdkDropList, CdkDrag],
  templateUrl: './board-columns.html',
  styleUrl: './board-columns.scss',
  standalone: true,
})
export class BoardColumns implements OnInit {
  @Input() title: string = '';
  @Input() tasks: Task[] = [];
  @Input() columnId: string = '';
  @Input() showAddButton: boolean = true;
  @Output() addTaskClicked = new EventEmitter<string>();
  @Output() taskClicked = new EventEmitter<Task>();
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() subtaskToggled = new EventEmitter<{ task: Task; subtask: any }>();
  @Output() moveTaskRequested = new EventEmitter<{ task: Task; targetColumn: string }>();

  private taskService = inject(BoardTasksService);
  private firestore = inject(Firestore);
  private router = inject(Router);

  isHovering = false;
  isMobile = false;
  isTabletOrBelow = false;
  showMoveMenu: { [key: string]: boolean } = {};

  /**
 * Checks and updates the isMobile property based on the current window width.
 * Triggered on window resize.
 */
  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
  }

  /**
 * Closes all move menus when a click occurs outside of the menu elements.
 *
 * @param event - The click event.
 */
  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.move-menu') && !target.closest('.mobile-move-btn')) {
      Object.keys(this.showMoveMenu).forEach((key) => {
        this.showMoveMenu[key] = false;
      });
    }
  }

  /**
 * Lifecycle hook that is called after component initialization.
 * Checks the screen size on initialization.
 */
  ngOnInit() {
    this.checkScreenSize();
  }

  /**
 * Returns the appropriate icon path for the add task button based on hover state.
 */
  get addTaskIcon(): string {
    return this.isHovering ? 'assets/board/add-task-v2.png' : 'assets/board/add-task-v4.png';
  }

  /**
 * Handles the add task button click.
 * Navigates to the add task page on mobile, emits an event otherwise.
 */
  onAddTaskClick() {
    if (this.isMobile) {
      this.router.navigate(['/add-task']);
    } else {
      this.addTaskClicked.emit(this.columnId);
    }
  }

  /**
 * Emits an event when a task card is clicked.
 *
 * @param task - The clicked task.
 */
  onTaskClick(task: Task) {
    this.taskClicked.emit(task);
  }

  /**
 * Emits an event when a subtask is toggled.
 *
 * @param event - The subtask toggle event containing the task and subtask.
 */
  onSubtaskToggled(event: { task: Task; subtask: any }) {
    this.subtaskToggled.emit(event);
  }

  /**
 * Toggles the visibility of the move menu for a specific task.
 *
 * @param taskId - The ID of the task.
 * @param event - The click event.
 */
  toggleMoveMenu(taskId: string, event: Event) {
    event.stopPropagation();
    this.showMoveMenu[taskId] = !this.showMoveMenu[taskId];
  }

  /**
 * Returns the available move options for a task based on its current column.
 *
 * @param currentColumnId - The ID of the current column.
 * @returns An array of move option objects.
 */
  getMoveOptions(currentColumnId: string): { id: string; label: string; direction: string }[] {
    const columns = this.getBoardColumns();
    const currentIndex = this.getColumnIndex(columns, currentColumnId);
    return this.buildMoveOptions(columns, currentIndex);
  }

  /**
 * Returns the list of board columns with their IDs and labels.
 *
 * @returns An array of column objects.
 */
  private getBoardColumns(): { id: string; label: string }[] {
    return [
      { id: 'todo', label: 'To-do' },
      { id: 'inprogress', label: 'Progress' },
      { id: 'awaitfeedback', label: 'Feedback' },
      { id: 'done', label: 'Done' },
    ];
  }

  /**
 * Returns the index of the current column in the columns array.
 *
 * @param columns - The array of columns.
 * @param currentColumnId - The ID of the current column.
 * @returns The index of the current column.
 */
  private getColumnIndex(columns: { id: string; label: string }[], currentColumnId: string): number {
    return columns.findIndex((col) => col.id === currentColumnId);
  }

  /**
 * Builds the move options for a task based on its current position in the columns array.
 *
 * @param columns - The array of columns.
 * @param currentIndex - The index of the current column.
 * @returns An array of move option objects.
 */
  private buildMoveOptions(
    columns: { id: string; label: string }[],
    currentIndex: number
  ): { id: string; label: string; direction: string }[] {
    const options: { id: string; label: string; direction: string }[] = [];
    if (currentIndex > 0) {
      options.push({ ...columns[currentIndex - 1], direction: 'up' });
    }
    if (currentIndex < columns.length - 1) {
      options.push({ ...columns[currentIndex + 1], direction: 'down' });
    }
    return options;
  }

  /**
 * Emits an event to move a task to a different column and closes the move menu.
 *
 * @param task - The task to move.
 * @param targetColumn - The target column ID.
 * @param event - The click event/**
 * Checks and updates the isMobile property based on the current window width.
 * Triggered on window resize.
 */
  moveTaskToColumn(task: Task, targetColumn: string, event: Event) {
    event.stopPropagation();
    this.moveTaskRequested.emit({ task, targetColumn });
    this.showMoveMenu[task.id!] = false;
  }

/**
 * handle the drop event when a taskl is dragged and dropped.
 * Reorders tasks within the same column or moves them to another column.
 * @param event 
 * @returns 
 */
  async onDrop(event: CdkDragDrop<Task[]>) {
    if (this.isMobile) return;
    const task = event.item.data as Task;
    if (event.previousContainer === event.container) {
      await this.handleReorderInSameColumn(event);
    } else {
      await this.handleMoveToAnotherColumn(event, task);
    }
    this.taskDropped.emit(event);
  }

  /**
   * handles reordering tasks within the same column.
   * @param event 
   */
  private async handleReorderInSameColumn(event: CdkDragDrop<Task[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    await this.updateTaskOrder(event.container.data);
  }

/**
 * handles moving a task to another column.
 * @param event 
 * @param task 
 */
  private async handleMoveToAnotherColumn(event: CdkDragDrop<Task[]>, task: Task) {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    task.status = this.columnId as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
    await this.taskService.updateTask(task.id!, task);
    await this.updateTaskOrder(event.previousContainer.data);
    await this.updateTaskOrder(event.container.data);
  }

  /**
   * handles updating the order of tasks in the database.
   * @param tasks 
   */
  private async updateTaskOrder(tasks: Task[]) {
    const batch = writeBatch(this.firestore);
    tasks.forEach((task, index) => {
      if (task.id) {
        const taskRef = doc(this.firestore, 'tasks', task.id);
        batch.update(taskRef, { order: index });
      }
    });
    await batch.commit();
  }
}
