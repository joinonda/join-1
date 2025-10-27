import { Component } from '@angular/core';

/**
 * Add Button Component - Plus-Button zum Hinzufügen von Tasks
 *
 * Diese wiederverwendbare Component zeigt einen "Add Task" Button an.
 *
 * Funktionen:
 * - Button mit Plus-Icon und "Add task" Text
 * - Click-Handler zum Öffnen des Add-Task-Dialogs
 * - Primäres Styling im Board-Design
 *
 * Output:
 * - onClick: Event wird an Parent-Component weitergegeben
 *
 * Verwendet in: HeaderTop (im Board-Header)
 * Kann auch in anderen Kontexten wiederverwendet werden (z.B. Spalten-Header)
 */
@Component({
  selector: 'app-add-button',
  imports: [],
  templateUrl: './add-button.html',
  styleUrl: './add-button.scss',
  standalone: true,
})
export class AddButton {}
