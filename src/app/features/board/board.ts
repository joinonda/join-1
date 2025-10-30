import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { BoardColumns } from './board-columns/board-columns';
import { TaskModal } from './task-modal/task-modal';
import { ShowTaskModal } from './task-modal/show-task-modal/show-task-modal';
import { BoardHeader } from './board-header/board-header';


@Component({
  selector: 'app-board',
  imports: [CommonModule, BoardColumns, TaskModal, ShowTaskModal, BoardHeader],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  standalone: true,
})
export class Board implements OnInit, OnDestroy {
  private taskService = inject(BoardTasksService);
  private tasksSubscription?: Subscription;

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

  ngOnInit() {
    this.loadTasks();
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  loadTasks() {
    this.isLoading = true;
    this.tasksSubscription = this.taskService.getTasksByStatus().subscribe({
      next: (tasks) => {
        this.allTasks.todo = tasks.todo.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.allTasks.inprogress = tasks.inprogress.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.allTasks.awaitfeedback = tasks.awaitfeedback.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.allTasks.done = tasks.done.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (this.showViewTaskModal && this.selectedTask && this.selectedTask.id) {
          const updatedTask = this.findTaskById(this.selectedTask.id);
          if (updatedTask) {
            this.selectedTask = { ...updatedTask };
          }
        }
        this.updateDisplayedTasks();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  findTaskById(taskId: string): Task | null {
    for (const column of this.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }

  onSearch(query: string) {
    this.searchQuery = query.toLowerCase().trim();
    this.updateDisplayedTasks();
  }

  updateDisplayedTasks() {
    if (!this.searchQuery) {
      this.columns[0].tasks = this.allTasks.todo;
      this.columns[1].tasks = this.allTasks.inprogress;
      this.columns[2].tasks = this.allTasks.awaitfeedback;
      this.columns[3].tasks = this.allTasks.done;
      this.searchError = '';
    } else {
      this.columns[0].tasks = this.filterTasks(this.allTasks.todo);
      this.columns[1].tasks = this.filterTasks(this.allTasks.inprogress);
      this.columns[2].tasks = this.filterTasks(this.allTasks.awaitfeedback);
      this.columns[3].tasks = this.filterTasks(this.allTasks.done);

      const totalFound =
        this.columns[0].tasks.length +
        this.columns[1].tasks.length +
        this.columns[2].tasks.length +
        this.columns[3].tasks.length;

      this.searchError = totalFound === 0 ? 'No tasks found' : '';
    }
    this.columns.forEach(col => {
      col.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
  }

  filterTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => {
      const matchesTitle = task.title.toLowerCase().includes(this.searchQuery);
      const matchesDescription =
        task.description && task.description.toLowerCase().includes(this.searchQuery);

      return matchesTitle || matchesDescription;
    });
  }

  // async onTaskDrop(event: CdkDragDrop<Task[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     const task = event.previousContainer.data[event.previousIndex];
  //     const newStatus = this.getStatusFromContainerId(event.container.id);
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //     try {
  //       await this.taskService.updateTaskStatus(task.id!, newStatus);
  //     } catch (error) {
  //       console.error('Error updating task status:', error);
  //       transferArrayItem(
  //         event.container.data,
  //         event.previousContainer.data,
  //         event.currentIndex,
  //         event.previousIndex
  //       );
  //     }
  //   }
  // }

  // getStatusFromContainerId(containerId: string): 'todo' | 'inprogress' | 'awaitfeedback' | 'done' {
  //   return containerId as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
  // }

  openAddTaskModal(status: string) {
    this.defaultStatus = status as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
    this.showAddTaskModal = true;
  }

  closeAddTaskModal() {
    this.showAddTaskModal = false;
  }

  openViewTaskModal(task: Task) {
    this.selectedTask = { ...task };
    this.showViewTaskModal = true;
  }

  closeViewTaskModal() {
    this.showViewTaskModal = false;
    this.selectedTask = null;
  }

  async handleTaskCreated(task: Omit<Task, 'id' | 'createdAt'>) {
    try {
      await this.taskService.createTask(task);
      this.closeAddTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  handleEditTask(task: Task) {
    this.selectedTask = { ...task };
  }

  async handleDeleteTask(taskId: string) {
    try {
      await this.taskService.deleteTask(taskId);
      this.closeViewTaskModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async onSubtaskToggled(event: { task: Task; subtask: any }) {
    try {
      await this.taskService.updateTask(event.task.id!, event.task);
    } catch (error) {
      console.error('Error updating subtask:', error);
      // Revert the change on error
      event.subtask.completed = !event.subtask.completed;
    }
  }
}
