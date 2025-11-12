import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board-search',
  imports: [FormsModule],
  templateUrl: './board-search.html',
  styleUrl: './board-search.scss',
  standalone: true
})
export class BoardSearch {
  @Input() searchError = '';
  @Output() search = new EventEmitter<string>();
  searchValue = '';

  /**
 * Emits the current search value whenever the user types in the search input.
 */
  onSearchInput() {
    this.search.emit(this.searchValue);
  }
}