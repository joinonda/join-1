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
  query,
  where,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Task, Subtask, BoardSettings } from '../interfaces/board-tasks-interface';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class BoardTasksService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private tasksCollection = collection(this.firestore, 'tasks');
  private settingsCollection = collection(this.firestore, 'boardSettings');
  private viewModeSubject = new BehaviorSubject<'public' | 'private'>('public');
  public viewMode$ = this.viewModeSubject.asObservable();

  constructor() {
    this.loadUserSettings();
  }

  /**
  * Loads the saved view mode setting for the current user from Firestore and updates the view mode subject. (currently deaktivated)
  */
  private async loadUserSettings() {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;
    const settingsDoc = doc(this.firestore, `boardSettings/${user.id}`);
    const snapshot = await getDoc(settingsDoc);
    if (snapshot.exists()) {
      const data = snapshot.data() as BoardSettings;
      this.viewModeSubject.next(data.viewMode);
    }
  }

  /**
 * Switches between public and private view modes for the current user and updates the setting in Firestore. (currently deaktivated)
 */
  async toggleViewMode(mode: 'public' | 'private'): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;
    const settingsDoc = doc(this.firestore, `boardSettings/${user.id}`);
    await setDoc(settingsDoc, {
      userId: user.id,
      viewMode: mode,
      lastChanged: Timestamp.now()
    });
    this.viewModeSubject.next(mode);
  }

  /**
 * Retrieves all private tasks for a given user from Firestore.   (currently deaktivated)
 *
 * @param userId - The ID of the user whose private tasks should be fetched.
 * @returns An observable of the user's private tasks.
 */
  private getPrivateTasks(userId: string): Observable<Task[]> {
    const privateQuery = query(
      this.tasksCollection,
      where('isPrivate', '==', true),
      where('ownerId', '==', userId)
    );
    return collectionData(privateQuery, { idField: 'id' }) as Observable<Task[]>;
  }

  /**
 * Retrieves all public tasks from Firestore (tasks that are not marked as private).
 *
 * @returns An observable of all public tasks.
 */
  private getPublicTasks(): Observable<Task[]> {
    return (collectionData(this.tasksCollection, { idField: 'id' }) as Observable<Task[]>)
      .pipe(
        map(tasks => tasks.filter(task => task.isPrivate !== true))
      );
  }

  /**
   * Resolves which tasks to fetch based on the current view mode and user.
   *
   * @param viewMode - The current board view mode ('public' or 'private').
   * @param user - The current user object.
   * @returns An observable of the appropriate tasks.
   */
  private resolveTasks(viewMode: 'public' | 'private', user: any): Observable<Task[]> {
    if (viewMode === 'private' && user?.id) {
      return this.getPrivateTasks(user.id);
    } else {
      return this.getPublicTasks();
    }
  }

  /**
 * Returns all tasks for the current view mode and user as an observable.
 *
 * @returns An observable of all relevant tasks.
 */
  getAllTasks(): Observable<Task[]> {
    return combineLatest([
      this.viewMode$,
      this.authService.currentUser$
    ]).pipe(
      switchMap(([viewMode, user]) => this.resolveTasks(viewMode, user))
    );
  }

  /**
 * Returns all tasks grouped by their status as an observable.
 *
 * @returns An observable with tasks grouped into 'todo', 'inprogress', 'awaitfeedback', and 'done'.
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
      })));
  }

  /**
   * Creates a new task in Firestore for the current user and view mode.
   *
   * @param task - The task data (without id and createdAt).
   * @returns A promise that resolves to the new task's ID.
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
    const user = this.authService.getCurrentUser();
    const currentViewMode = this.viewModeSubject.value;
    const taskData = {
      ...task,
      isPrivate: currentViewMode === 'private',
      ownerId: user?.id || 'guest',
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(this.tasksCollection, taskData);
    return docRef.id;
  }

  /**
 * Returns the current view mode ('public' or 'private').
 *
 * @returns The current view mode.
 */
  getCurrentViewMode(): 'public' | 'private' {
    return this.viewModeSubject.value;
  }

  /**
 * Updates an existing task in Firestore with the provided updates.
 *
 * @param taskId - The ID of the task to update.
 * @param updates - The fields to update on the task.
 * @returns A promise that resolves when the update is complete.
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

  /**
 * Updates the status of a task in Firestore and sets the updatedAt timestamp.
 *
 * @param taskId - The ID of the task to update.
 * @param newStatus - The new status for the task.
 * @returns A promise that resolves when the status is updated.
 */
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
 * Deletes a task from Firestore.
 *
 * @param taskId - The ID of the task to delete.
 * @returns A promise that resolves when the task is deleted.
 */
  async deleteTask(taskId: string): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', taskId);
    await deleteDoc(taskDoc);
  }

  /**
 * Moves a task to a new status (column) in Firestore (used for drag & drop).
 *
 * @param taskId - The ID of the task to move.
 * @param newStatus - The new status for the task.
 * @returns A promise that resolves when the task is moved.
 */
  async moveTask(
    taskId: string,
    newStatus: 'todo' | 'inprogress' | 'awaitfeedback' | 'done'
  ): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', taskId);
    await updateDoc(taskDoc, { status: newStatus });
  }
}