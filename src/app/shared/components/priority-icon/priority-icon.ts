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

  /**
 * The priority level to display. Can be 'urgent', 'medium', or 'low'.
 * 
 * @type {'urgent' | 'medium' | 'low'}
 * @default 'medium'
 */
  @Input() priority: 'urgent' | 'medium' | 'low' = 'medium';

  /**
 * Whether to show the label text next to the icon.
 * 
 * @type {boolean}
 * @default false
 */
  @Input() showLabel: boolean = false;

  /**
 * Returns the configuration object (icon path, label, color) for the current priority.
 *
 * @returns An object containing icon, label, and color for the selected priority.
 */
  get priorityConfig() {
    const configs = {
      urgent: { icon: 'assets/board/urgent.png', label: 'Urgent', color: '#ff3d00' },
      medium: { icon: 'assets/board/medium.png', label: 'Medium', color: '#ffa800' },
      low: { icon: 'assets/board/low.png', label: 'Low', color: '#7ae229' },
    };
    return configs[this.priority];
  }
}
