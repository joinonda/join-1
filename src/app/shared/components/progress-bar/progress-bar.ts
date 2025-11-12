import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  @Input() progress: number = 0;

  @Input() color: string = '#4589ff';

  @Input() height: 'small' | 'medium' = 'small';

  @Input() label?: string;

  get progressPercentage(): number {
    return Math.min(Math.max(this.progress, 0), 100);
  }
}
