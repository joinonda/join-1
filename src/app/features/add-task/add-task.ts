import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task, Subtask } from '../../core/interfaces/board-tasks-interface';
import { BoardTasksService } from '../../core/services/board-tasks-service';
import { Timestamp } from '@angular/fire/firestore';
import { AddTaskFormFields } from './add-task-form-fields/add-task-form-fields';

/**
 * Add task component for creating new tasks.
 * Handles form submission, task creation, and navigation.
 */
@Component({
  selector: 'app-add-task',
  imports: [CommonModule, AddTaskFormFields],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
  standalone: true,
})
export class AddTask {
  private taskService = inject(BoardTasksService);
  private router = inject(Router);

  @ViewChild(AddTaskFormFields) formFields!: AddTaskFormFields;

  showSuccessToast = false;

  /**
   * Validates and submits the form to create a new task.
   * Converts date, creates task object, saves to database, and navigates to board.
   */
  async onSubmit() {
    if (!this.formFields.validateForm()) {
      return;
    }

    const dueDateTimestamp = this.convertDueDateToTimestamp();
    const newTask = this.createTaskObject(dueDateTimestamp);

    await this.taskService.createTask(newTask);
    this.displaySuccessAndNavigate();
  }

  /**
   * Converts the due date string to a Firestore Timestamp.
   * Parses DD/MM/YYYY format and creates a timestamp object.
   *
   * @returns Firestore Timestamp object
   */
  private convertDueDateToTimestamp(): Timestamp {
    const [day, month, year] = this.formFields.dueDate.split('/');
    const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return Timestamp.fromDate(dateObject);
  }

  /**
   * Creates a task object from form field values.
   * Trims text fields and spreads array values for immutability.
   *
   * @param dueDateTimestamp - The converted due date as Firestore Timestamp
   * @returns Task object without id and createdAt fields
   */
  private createTaskObject(dueDateTimestamp: Timestamp): Omit<Task, 'id' | 'createdAt'> {
    return {
      title: this.formFields.title.trim(),
      description: this.formFields.description.trim(),
      dueDate: dueDateTimestamp,
      priority: this.formFields.priority,
      category: this.formFields.category,
      status: 'todo',
      assignedTo: [...this.formFields.selectedContactIds],
      subtasks: this.formFields.subtasks,
    };
  }

  /**
   * Displays success toast and navigates to board page.
   * Shows toast for 1.5 seconds before navigation.
   */
  private displaySuccessAndNavigate(): void {
    this.showSuccessToast = true;

    setTimeout(() => {
      this.showSuccessToast = false;
      this.router.navigate(['/board']);
    }, 1500);
  }

  /**
   * Resets all form fields to their default values.
   * Delegates to form fields component reset method.
   */
  resetForm() {
    this.formFields.resetForm();
  }
}
