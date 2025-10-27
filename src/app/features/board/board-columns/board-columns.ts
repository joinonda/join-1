import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-board-columns',
  imports: [CommonModule, TaskCard],
  templateUrl: './board-columns.html',
  styleUrl: './board-columns.scss',
  standalone: true,
})
export class BoardColumns {
  @Input() title: string = '';
  @Input() tasks: any[] = []; // TODO: Typisierung mit Task Interface
}
