import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardColumns } from './board-columns/board-columns';

/**
 * Board Component - Haupt-Component für das Kanban-Board
 */
@Component({
  selector: 'app-board',
  imports: [CommonModule, BoardColumns],
  templateUrl: './board.html',
  styleUrl: './board.scss',
  standalone: true,
})
export class Board {
  // Platzhalter-Daten für Patty zum Testen
  columns = [
    {
      id: 'todo',
      title: 'To do',
      tasks: [],
    },
    {
      id: 'inprogress',
      title: 'In progress',
      tasks: [
        {
          id: 1,
          category: 'User Story',
          categoryColor: '#0038FF',
          title: 'Kochwelt Page & Recipe Recommender',
          description: 'Build start page with recipe recommendation...',
          subtasks: [
            { id: 1, title: 'Subtask 1', completed: true },
            { id: 2, title: 'Subtask 2', completed: false },
          ],
          assignedTo: [
            { id: 1, name: 'Anton Mayer', initials: 'AM', color: '#FF7A00' },
            { id: 2, name: 'Emmanuel Mauer', initials: 'EM', color: '#6E52FF' },
            { id: 3, name: 'Marcel Bauer', initials: 'MB', color: '#FC71FF' },
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'awaitfeedback',
      title: 'Await feedback',
      tasks: [
        {
          id: 2,
          category: 'Technical Task',
          categoryColor: '#1FD7C1',
          title: 'HTML Base Template Creation',
          description: 'Create reusable HTML base templates...',
          subtasks: [],
          assignedTo: [
            { id: 4, name: 'Tatjana Wolf', initials: 'TW', color: '#FF5EB3' },
            { id: 5, name: 'Benedikt Ziegler', initials: 'BZ', color: '#6E52FF' },
            { id: 6, name: 'Anton Mayer', initials: 'AM', color: '#FF7A00' },
          ],
          priority: 'low',
        },
        {
          id: 3,
          category: 'User Story',
          categoryColor: '#0038FF',
          title: 'Daily Kochwelt Recipe',
          description: 'Implement daily recipe and portion calculator...',
          subtasks: [],
          assignedTo: [
            { id: 7, name: 'Emmanuel Mauer', initials: 'EM', color: '#FFBB2B' },
            { id: 8, name: 'Anton Mayer', initials: 'AM', color: '#6E52FF' },
            { id: 9, name: 'Tatjana Wolf', initials: 'TW', color: '#FF5EB3' },
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: 4,
          category: 'Technical Task',
          categoryColor: '#1FD7C1',
          title: 'CSS Architecture Planning',
          description: 'Define CSS naming conventions and structure...',
          subtasks: [
            { id: 1, title: 'Setup', completed: true },
            { id: 2, title: 'Documentation', completed: true },
          ],
          assignedTo: [
            { id: 10, name: 'Sofia Müller', initials: 'SM', color: '#00BEE8' },
            { id: 11, name: 'Benedikt Ziegler', initials: 'BZ', color: '#9327FF' },
          ],
          priority: 'urgent',
        },
      ],
    },
  ];
}
