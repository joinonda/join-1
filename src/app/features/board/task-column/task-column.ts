import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { TaskCard } from '../task-card/task-card';

/**
 * Task Column Component - Einzelne Kanban-Spalte (wiederverwendbar)
 *
 * Diese Component repräsentiert EINE Spalte im Kanban-Board.
 * Sie wird 4x verwendet für: To do, In progress, Await feedback, Done
 *
 * Funktionen:
 * - Anzeige aller Tasks einer bestimmten Status-Kategorie
 * - Drag & Drop Zone für Tasks (cdkDropList)
 * - Darstellung von TaskCard Components
 * - Falls keine Tasks vorhanden: Anzeige von ColumnEmpty Component
 *
 * Input Properties:
 * - tasks: Array von Tasks für diese Spalte
 * - status: Spalten-Status (todo, inprogress, awaitfeedback, done)
 *
 * Wiederverwendbar für alle 4 Spalten-Typen!
 */
@Component({
  selector: 'app-task-column',
  imports: [CommonModule, CdkDropList, TaskCard],
  templateUrl: './task-column.html',
  styleUrl: './task-column.scss',
  standalone: true,
})
export class TaskColumn {
  @Input() tasks: Task[] = [];
  @Input() status!: string;
  @Input() title!: string;
}
