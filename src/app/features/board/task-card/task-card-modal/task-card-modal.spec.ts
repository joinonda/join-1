import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardModal } from './task-card-modal';

describe('TaskCardModal', () => {
  let component: TaskCardModal;
  let fixture: ComponentFixture<TaskCardModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
