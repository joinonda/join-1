import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardEdit } from './task-card-edit';

describe('TaskCardEdit', () => {
  let component: TaskCardEdit;
  let fixture: ComponentFixture<TaskCardEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
