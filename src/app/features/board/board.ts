import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { BoardColumns } from './board-columns/board-columns';
import { TaskModal } from './task-modal/task-modal';

@Component({
  selector: 'app-board',
  imports: [CommonModule, BoardColumns, TaskModal],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  standalone: true,
})
export class Board implements OnInit {
  private taskService = inject(BoardTasksService);

  columns = [
    { id: 'todo', title: 'To do', tasks: [] as Task[] },
    { id: 'inprogress', title: 'In progress', tasks: [] as Task[] },
    { id: 'awaitfeedback', title: 'Await feedback', tasks: [] as Task[] },
    { id: 'done', title: 'Done', tasks: [] as Task[] },
  ];

  showAddTaskModal = false;
  defaultStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done' = 'todo';
  isLoading = true;

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasksByStatus().subscribe({
      next: (tasks) => {
        this.columns[0].tasks = tasks.todo;
        this.columns[1].tasks = tasks.inprogress;
        this.columns[2].tasks = tasks.awaitfeedback;
        this.columns[3].tasks = tasks.done;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      },
    });
  }

 openAddTaskModal(status: string) {
  this.defaultStatus = status as 'todo' | 'inprogress' | 'awaitfeedback' | 'done';
  this.showAddTaskModal = true;
  console.log('Opening modal for status:', status);
}

  closeAddTaskModal() {
    this.showAddTaskModal = false;
  }
  

  async handleTaskCreated(task: Omit<Task, 'id' | 'createdAt'>) {
    try {
      await this.taskService.createTask(task);
      this.closeAddTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }
}