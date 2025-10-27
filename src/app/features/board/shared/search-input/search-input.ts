import { Component } from '@angular/core';

/**
 * Search Input Component - Suchfeld zum Filtern von Tasks
 *
 * Diese wiederverwendbare Component stellt ein Suchfeld mit Icon dar.
 *
 * Funktionen:
 * - Input-Feld mit Lupe-Icon
 * - Placeholder: "Find Task"
 * - Live-Filtering: Emitiert Suchbegriff bei jeder Eingabe (debounced)
 * - Clear-Button (X) zum Löschen der Eingabe
 *
 * Output:
 * - searchChange: EventEmitter<string> - Emitiert den Suchbegriff an Parent
 *
 * Verwendet in: HeaderTop (im Board-Header)
 * Parent-Component (Board) filtert die Tasks basierend auf dem Suchbegriff
 */
@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
  standalone: true,
})
export class SearchInput {}
