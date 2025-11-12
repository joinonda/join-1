import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskModalFormFields } from './add-task-modal-form-fields';

describe('AddTaskModalFormFields', () => {
  let component: AddTaskModalFormFields;
  let fixture: ComponentFixture<AddTaskModalFormFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskModalFormFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskModalFormFields);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
