import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, Subtask } from '../interfaces/board-tasks-interface';

@Injectable({
  providedIn: 'root',
})
export class BoardTasksService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  /**
   * Alle Tasks abrufen
   */
  getAllTasks(): Observable<Task[]> {
    return collectionData(this.tasksCollection, { idField: 'id' }).pipe(
      map((tasks) => tasks as Task[])
    );
  }

  /**
   * Tasks nach Status gruppiert abrufen
   */
  getTasksByStatus(): Observable<{
    todo: Task[];
    inprogress: Task[];
    awaitfeedback: Task[];
    done: Task[];
  }> {
    return this.getAllTasks().pipe(
      map((tasks) => ({
        todo: tasks.filter((t) => t.status === 'todo'),
        inprogress: tasks.filter((t) => t.status === 'inprogress'),
        awaitfeedback: tasks.filter((t) => t.status === 'awaitfeedback'),
        done: tasks.filter((t) => t.status === 'done'),
      }))
    );
  }

  /**
   * Neuen Task erstellen
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
    const taskData = {
      ...task,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(this.tasksCollection, taskData);
    return docRef.id;
  }

  /**
   * Task aktualisieren
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    const updateData: any = { ...updates };
    if (updates.assignedTo !== undefined) {
      updateData.assignedTo = updates.assignedTo;
    }
    try {
      await updateDoc(taskDoc, updateData);
    } catch (error) {
      console.error('Firestore update failed:', error);
      throw error;
    }
  }

  async updateTaskStatus(
    taskId: string,
    newStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done'
  ): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);

    await updateDoc(taskDoc, {
      status: newStatus,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Task löschen
   */
  async deleteTask(taskId: string): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', taskId);
    await deleteDoc(taskDoc);
  }

  /**
   * Task in neue Spalte verschieben (Drag & Drop)
   */
  async moveTask(
    taskId: string,
    newStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done'
  ): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', taskId);
    await updateDoc(taskDoc, { status: newStatus });
  }
}