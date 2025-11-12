import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTaskFormFieldsComponent } from './edit-task-form-fields';

describe('EditTaskFormFieldsComponent', () => {
  let component: EditTaskFormFieldsComponent;
  let fixture: ComponentFixture<EditTaskFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTaskFormFieldsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTaskFormFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
