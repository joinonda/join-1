import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/interfaces/board-tasks-interface';
import { TaskColumn } from '../task-column/task-column';

/**
 * Board Columns Component - Container für alle Kanban-Spalten
 *
 * Diese Component ist der Haupt-Container für die 4 Kanban-Spalten.
 * Sie managed das Layout und die Anordnung der einzelnen TaskColumn-Components.
 *
 * Enthält:
 * - 4x TaskColumn Components (To do, In progress, Await feedback, Done)
 * - Drag & Drop Group für spaltenübergreifendes Verschieben (cdkDropListGroup)
 * - Responsive Layout-Grid für die Spalten
 *
 * Die Drop-Handler und Task-Listen liegen in den TaskColumn Components.
 */
@Component({
  selector: 'app-board-columns',
  imports: [CommonModule, CdkDropListGroup, TaskColumn],
  templateUrl: './board-columns.html',
  styleUrl: './board-columns.scss',
  standalone: true,
})
export class BoardColumns {
  @Input() todoTasks: Task[] = [];
  @Input() inprogressTasks: Task[] = [];
  @Input() awaitfeedbackTasks: Task[] = [];
  @Input() doneTasks: Task[] = [];
}
