import { Component,  OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Task } from '../../core/interfaces/board-tasks-interface';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss'
})

export class Summary implements OnInit, OnDestroy {
  private boardTasksService = inject(BoardTasksService);
  private tasksSubscription?: Subscription;

  todoIconSrc: string = 'assets/summary/edit-white-signup.png';
  doneIconSrc: string = 'assets/summary/done-checkmark.png';

  todoCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  tasksInBoardCount: number = 0;
  tasksInProgressCount: number = 0;
  awaitingFeedbackCount: number = 0;
  upcomingDeadline: string = 'No deadline';

  ngOnInit(): void {
    this.loadTaskStatistics();
  }

  ngOnDestroy(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  private loadTaskStatistics(): void {
    this.tasksSubscription = this.boardTasksService.getAllTasks().subscribe(
      (tasks: Task[]) => {
        this.calculateStatistics(tasks);
      }
    );
  }

  private calculateStatistics(tasks: Task[]): void {
    this.todoCount = tasks.filter(t => t.status === 'todo').length;

    this.doneCount = tasks.filter(t => t.status === 'done').length;

    this.urgentCount = tasks.filter(t => t.priority === 'urgent').length;

    this.tasksInBoardCount = tasks.length;

    this.tasksInProgressCount = tasks.filter(t => t.status === 'inprogress').length;

    this.awaitingFeedbackCount = tasks.filter(t => t.status === 'awaitfeedback').length;

    this.upcomingDeadline = this.calculateUpcomingDeadline(tasks);
  }

  private calculateUpcomingDeadline(tasks: Task[]): string {
    const tasksWithDueDate = tasks.filter(t => t.dueDate && t.status !== 'done');
    
    if (tasksWithDueDate.length === 0) {
      return 'No deadline';
    }

    const sortedTasks = tasksWithDueDate.sort((a, b) => {
      const dateA = this.getDateFromDueDate(a.dueDate!);
      const dateB = this.getDateFromDueDate(b.dueDate!);
      return dateA.getTime() - dateB.getTime();
    });

    const earliestTask = sortedTasks[0];
    return this.formatDeadline(earliestTask.dueDate!);
  }

  private getDateFromDueDate(dueDate: string | Timestamp): Date {
    if (typeof dueDate === 'string') {
      const [day, month, year] = dueDate.split('/').map(Number);
      return new Date(year, month - 1, day);
    } else {
      return dueDate.toDate();
    }
  }

  private formatDeadline(dueDate: string | Timestamp): string {
    const date = this.getDateFromDueDate(dueDate);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  onTodoHover(isHovering: boolean): void {
    if (isHovering) {
      this.todoIconSrc = 'assets/summary/edit-black-signup.png';
    } else {
      this.todoIconSrc = 'assets/summary/edit-white-signup.png';
    }
  }

  onDoneHover(isHovering: boolean): void {
    if (isHovering) {
      this.doneIconSrc = 'assets/summary/done-checkmark-hover.png';
    } else {
      this.doneIconSrc = 'assets/summary/done-checkmark.png';
    }
  }
}
