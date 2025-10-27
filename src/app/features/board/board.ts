import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { TaskCard } from './task-card/task-card';

@Component({
  selector: 'app-board',
  imports: [CommonModule, TaskCard],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  standalone: true,
})
export class Board implements OnInit {
  private taskService = inject(BoardTasksService);

  todoTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  awaitfeedbackTasks: Task[] = [];
  doneTasks: Task[] = [];

  isLoading = true;

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasksByStatus().subscribe({
      next: (tasks) => {
        this.todoTasks = tasks.todo;
        this.inprogressTasks = tasks.inprogress;
        this.awaitfeedbackTasks = tasks.awaitfeedback;
        this.doneTasks = tasks.done;
        this.isLoading = false;
        console.log('Tasks loaded:', tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      },
    });
  }
}