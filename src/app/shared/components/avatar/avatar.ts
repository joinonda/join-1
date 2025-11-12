import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  @Input() initials: string = '';

  @Input() backgroundColor: string = '#2A3647';

  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Input() name?: string;
}
