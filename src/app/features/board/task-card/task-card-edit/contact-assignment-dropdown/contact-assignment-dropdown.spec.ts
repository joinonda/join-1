import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactAssignmentDropdownComponent } from './contact-assignment-dropdown';

describe('ContactAssignmentDropdownComponent', () => {
  let component: ContactAssignmentDropdownComponent;
  let fixture: ComponentFixture<ContactAssignmentDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAssignmentDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactAssignmentDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
