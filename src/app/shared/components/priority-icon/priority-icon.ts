import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PriorityIcon Component - Zeigt Priority-Icons an
 * Urgent (↑↑ rot), Medium (= orange), Low (↓ grün)
 */
@Component({
  selector: 'app-priority-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-icon.html',
  styleUrl: './priority-icon.scss',
})
export class PriorityIcon {
  @Input() priority: 'urgent' | 'medium' | 'low' = 'medium';

  @Input() showLabel: boolean = false;

  get priorityConfig() {
    const configs = {
      urgent: { icon: 'assets/board/urgent.png', label: 'Urgent', color: '#ff3d00' },
      medium: { icon: 'assets/board/medium.png', label: 'Medium', color: '#ffa800' },
      low: { icon: 'assets/board/low.png', label: 'Low', color: '#7ae229' },
    };
    return configs[this.priority];
  }
}
