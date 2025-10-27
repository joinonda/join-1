import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { BoardHeader } from './board-header/board-header';
import { BoardColumns } from './board-columns/board-columns';

/**
 * Board Component - Haupt-Component für das Kanban-Board
 *
 * Diese Component ist der zentrale Container für die Board-Ansicht.
 * Sie verwaltet alle Tasks und deren Verteilung auf die verschiedenen Spalten (Todo, In Progress, Await Feedback, Done).
 *
 * Hauptaufgaben:
 * - Laden aller Tasks aus dem Service
 * - Verwaltung der Task-Arrays für jede Spalte
 * - Koordination des gesamten Board-Layouts (Header + Columns)
 * - Bereitstellung der Daten an Child-Components
 */
@Component({
  selector: 'app-board',
  imports: [CommonModule, BoardHeader, BoardColumns],
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
        console.log('Loaded tasks:', tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      },
    });
  }
}
