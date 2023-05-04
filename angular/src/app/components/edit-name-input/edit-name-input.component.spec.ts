import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNameInputComponent } from './edit-name-input.component';

describe('EditNameInputComponent', () => {
  let component: EditNameInputComponent;
  let fixture: ComponentFixture<EditNameInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditNameInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
