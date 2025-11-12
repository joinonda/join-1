import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardEditFormFields } from './task-card-edit-form-fields';

describe('TaskCardEditFormFields', () => {
  let component: TaskCardEditFormFields;
  let fixture: ComponentFixture<TaskCardEditFormFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardEditFormFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCardEditFormFields);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
