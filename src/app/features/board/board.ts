import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { BoardColumns } from './board-columns/board-columns';
import { AddTaskModal } from './add-task-modal/add-task-modal';
import { TaskCardModal } from './task-card/task-card-modal/task-card-modal';
import { BoardHeader } from './board-header/board-header';

/**
 * Main board component for task management with Kanban-style columns.
 * Handles task display, creation, editing, deletion, search, and view mode switching.
 */
@Component({
  selector: 'app-board',
  imports: [CommonModule, BoardColumns, AddTaskModal, TaskCardModal, BoardHeader],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  standalone: true,
})
export class Board implements OnInit, OnDestroy {
  private taskService = inject(BoardTasksService);
  private tasksSubscription?: Subscription;
  private viewModeSubscription?: Subscription;

  currentViewMode: 'public' | 'private' = 'public';

  allTasks = {
    todo: [] as Task[],
    inprogress: [] as Task[],
    awaitfeedback: [] as Task[],
    done: [] as Task[],
  };

  columns = [
    { id: 'todo', title: 'To do', tasks: [] as Task[] },
    { id: 'inprogress', title: 'In progress', tasks: [] as Task[] },
    { id: 'awaitfeedback', title: 'Await feedback', tasks: [] as Task[] },
    { id: 'done', title: 'Done', tasks: [] as Task[] },
  ];

  showAddTaskModal = false;
  showViewTaskModal = false;
  selectedTask: Task | null = null;
  defaultStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done' = 'todo';
  isLoading = true;
  searchQuery = '';
  searchError = '';

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads tasks and subscribes to view mode changes.
   */
  ngOnInit() {
    this.loadTasks();
    this.subscribeToViewMode();
  }

  /**
   * Lifecycle hook that runs on component destruction.
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  /**
   * Subscribes to view mode changes from the task service.
   * Updates the current view mode when it changes.
   */
  subscribeToViewMode() {
    this.viewModeSubscription = this.taskService.viewMode$.subscribe((mode) => {
      this.currentViewMode = mode;
    });
  }

  /**
   * Toggles between public and private view modes.
   */
  async toggleViewMode() {
    const newMode = this.currentViewMode === 'public' ? 'private' : 'public';
    await this.taskService.toggleViewMode(newMode);
  }

  /**
   * Loads tasks from Firestore and subscribes to real-time updates.
   * Sorts tasks by order and updates the display.
   */
  loadTasks() {
    this.isLoading = true;
    this.tasksSubscription = this.taskService.getTasksByStatus().subscribe({
      next: (tasks) => {
        this.sortAllTasks(tasks);
        this.updateSelectedTaskIfNeeded();
        this.updateDisplayedTasks();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Sorts all tasks by their order property within each status category.
   * 
   * @param tasks - Object containing task arrays grouped by status
   */
  private sortAllTasks(tasks: {
    todo: Task[];
    inprogress: Task[];
    awaitfeedback: Task[];
    done: Task[];
  }): void {
    this.allTasks.todo = tasks.todo.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.allTasks.inprogress = tasks.inprogress.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.allTasks.awaitfeedback = tasks.awaitfeedback.sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    this.allTasks.done = tasks.done.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /**
   * Updates the selected task with latest data if the view modal is open.
   * Ensures the modal displays current task information.
   */
  private updateSelectedTaskIfNeeded(): void {
    if (this.showViewTaskModal && this.selectedTask && this.selectedTask.id) {
      const updatedTask = this.findTaskById(this.selectedTask.id);
      if (updatedTask) {
        this.selectedTask = { ...updatedTask };
      }
    }
  }

  /**
   * Finds a task by its ID across all columns.
   * 
   * @param taskId - The ID of the task to find
   * @returns The task if found, null otherwise
   */
  findTaskById(taskId: string): Task | null {
    for (const column of this.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  /**
   * Handles search query changes and updates displayed tasks.
   * 
   * @param query - The search query string
   */
  onSearch(query: string) {
    this.searchQuery = query.toLowerCase().trim();
    this.updateDisplayedTasks();
  }

  /**
   * Updates the displayed tasks based on current search query.
   * Shows all tasks if no search query, filters tasks otherwise.
   */
  updateDisplayedTasks() {
    if (!this.searchQuery) {
      this.assignAllTasks();
      this.searchError = '';
    } else {
      this.filterAndAssignTasks();
      this.updateSearchError();
    }

    this.sortColumnTasks();
  }

  /**
   * Assigns all tasks to their respective columns without filtering.
   */
  private assignAllTasks(): void {
    this.columns[0].tasks = this.allTasks.todo;
    this.columns[1].tasks = this.allTasks.inprogress;
    this.columns[2].tasks = this.allTasks.awaitfeedback;
    this.columns[3].tasks = this.allTasks.done;
  }

  /**
   * Filters and assigns tasks based on current search query.
   */
  private filterAndAssignTasks(): void {
    this.columns[0].tasks = this.filterTasks(this.allTasks.todo);
    this.columns[1].tasks = this.filterTasks(this.allTasks.inprogress);
    this.columns[2].tasks = this.filterTasks(this.allTasks.awaitfeedback);
    this.columns[3].tasks = this.filterTasks(this.allTasks.done);
  }

  /**
   * Updates the search error message based on number of results found.
   */
  private updateSearchError(): void {
    const totalFound =
      this.columns[0].tasks.length +
      this.columns[1].tasks.length +
      this.columns[2].tasks.length +
      this.columns[3].tasks.length;

    this.searchError = totalFound === 0 ? 'No tasks found' : '';
  }

  /**
   * Sorts tasks in all columns by their order property.
   */
  private sortColumnTasks(): void {
    this.columns.forEach((col) => {
      col.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
  }

  /**
   * Filters tasks based on search query.
   * Searches in both title and description fields.
   * 
   * @param tasks - Array of tasks to filter
   * @returns Filtered array of tasks matching the search query
   */
  filterTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => {
      const matchesTitle = task.title.toLowerCase().includes(this.searchQuery);
      const matchesDescription =
        task.description && task.description.toLowerCase().includes(this.searchQuery);
      return matchesTitle || matchesDescription;
    });
  }

  /**
   * Opens the add task modal with a specific default status.
   * 
   * @param status - The default status for the new task
   */
  openAddTaskModal(status: string) {
    this.defaultStatus = status as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
    this.showAddTaskModal = true;
  }

  /**
   * Closes the add task modal.
   */
  closeAddTaskModal() {
    this.showAddTaskModal = false;
  }

  /**
   * Opens the view task modal with the selected task.
   * 
   * @param task - The task to display in the modal
   */
  openViewTaskModal(task: Task) {
    this.selectedTask = { ...task };
    this.showViewTaskModal = true;
  }

  /**
   * Closes the view task modal and clears the selected task.
   */
  closeViewTaskModal() {
    this.showViewTaskModal = false;
    this.selectedTask = null;
  }

  /**
   * Handles task creation by saving to Firestore.
   * Closes the add task modal on success.
   * 
   * @param task - The task data to create (without id and createdAt)
   */
  async handleTaskCreated(task: Omit<Task, 'id' | 'createdAt'>) {
    try {
      await this.taskService.createTask(task);
      this.closeAddTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  /**
   * Handles task edit request by updating the selected task.
   * 
   * @param task - The updated task data
   */
  handleEditTask(task: Task) {
    this.selectedTask = { ...task };
  }

  /**
   * Handles task deletion by removing from Firestore.
   * Closes the view modal on success.
   * 
   * @param taskId - The ID of the task to delete
   */
  async handleDeleteTask(taskId: string) {
    try {
      await this.taskService.deleteTask(taskId);
      this.closeViewTaskModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  /**
   * Handles subtask toggle by updating the task in Firestore.
   * Reverts the toggle on error.
   * 
   * @param event - Object containing the task and toggled subtask
   */
  async onSubtaskToggled(event: { task: Task; subtask: any }) {
    try {
      await this.taskService.updateTask(event.task.id!, event.task);
    } catch (error) {
      console.error('Error updating subtask:', error);
      event.subtask.completed = !event.subtask.completed;
    }
  }

  /**
   * Handles task move request between columns.
   * Updates the task status in Firestore.
   * 
   * @param event - Object containing the task and target column
   */
  async onMoveTaskRequested(event: { task: Task; targetColumn: string }) {
    try {
      const { task, targetColumn } = event;
      if (!this.isValidMoveRequest(task, targetColumn)) return;

      const updatedTask = this.createUpdatedTask(task, targetColumn);
      await this.taskService.updateTask(task.id!, updatedTask);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }

  /**
   * Validates if a task move request is valid.
   * 
   * @param task - The task to move
   * @param targetColumn - The target column ID
   * @returns True if the move request is valid, false otherwise
   */
  private isValidMoveRequest(task: Task, targetColumn: string): boolean {
    if (!task.id || !targetColumn) {
      console.error('Invalid task or target column');
      return false;
    }
    return true;
  }

  /**
   * Creates an updated task object with new status.
   * 
   * @param task - The original task
   * @param targetColumn - The target column/status
   * @returns Updated task object with new status
   */
  private createUpdatedTask(task: Task, targetColumn: string): Task {
    return {
      ...task,
      status: targetColumn as 'todo' | 'inprogress' | 'awaitfeedback' | 'done',
    };
  }
}
