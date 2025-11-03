import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BoardAddButton } from './board-add-button/board-add-button';
import { BoardSearch } from './board-search/board-search';

@Component({
  selector: 'app-board-header',
  imports: [BoardAddButton, BoardSearch, CommonModule],
  templateUrl: './board-header.html',
  styleUrl: './board-header.scss',
  standalone: true,
})
export class BoardHeader {
  @Input() searchError = '';
  @Output() addTaskClick = new EventEmitter<void>();
  @Output() searchQuery = new EventEmitter<string>();


  constructor(private router: Router) {}

  onButtonClick() {
    this.addTaskClick.emit();
  }

  onSearch(query: string) {
    this.searchQuery.emit(query);
  }

  onMobileAddTaskClick(): void {
    if (window.innerWidth < 1350) {
      this.router.navigate(['/add-task']);
    } else {
      this.addTaskClick.emit();
    }
  }
}