import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/interfaces/board-tasks-interface';

/**
 * Task Card Component - Haupt-Component für eine einzelne Task-Karte
 *
 * Diese Component stellt eine einzelne Task-Karte im Kanban-Board dar.
 * Sie ist der Container für alle Task-Informationen und setzt sich aus mehreren Child-Components zusammen.
 *
 * Struktur der Card:
 * ┌─────────────────────────────┐
 * │ CardCategory (Badge)        │  ← User Story / Technical Task
 * │ CardContent (Titel + Desc)  │  ← Hauptinhalt
 * │ CardProgress (Subtasks)     │  ← Fortschrittsbalken (optional)
 * │ CardFooter (Assigned+Prio)  │  ← Avatare + Priority Icon
 * └─────────────────────────────┘
 *
 * Funktionen:
 * - Drag & Drop Support (cdkDrag)
 * - Click-Handler für Task-Details öffnen
 * - Input: task-Objekt mit allen Task-Daten
 *
 * Diese Component orchestriert nur - die Details liegen in den Child-Components!
 */
@Component({
  selector: 'app-task-card',
  imports: [CommonModule, CdkDrag],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  standalone: true,
})
export class TaskCard {
  @Input() task!: Task;

  /**
   * Berechnet die Anzahl der erledigten Subtasks
   */
  get completedSubtasksCount(): number {
    return this.task.subtasks?.filter((s) => s.completed).length || 0;
  }
}
