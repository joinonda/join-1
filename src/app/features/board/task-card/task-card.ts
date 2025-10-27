import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  standalone: true,
})
export class TaskCard {
  @Input() task: any = {}; // TODO: Typisierung mit Task Interface

  // Platzhalter-Getter für Berechnungen
  get progressPercentage(): number {
    if (!this.task.subtasks || this.task.subtasks.length === 0) return 0;
    const completed = this.task.subtasks.filter((st: any) => st.completed).length;
    return (completed / this.task.subtasks.length) * 100;
  }

  get completedSubtasks(): number {
    if (!this.task.subtasks) return 0;
    return this.task.subtasks.filter((st: any) => st.completed).length;
  }

  // TODO: Implementierung für Card-Click (z.B. Modal öffnen)
  onCardClick(): void {
    console.log('Task clicked:', this.task);
  }
}
