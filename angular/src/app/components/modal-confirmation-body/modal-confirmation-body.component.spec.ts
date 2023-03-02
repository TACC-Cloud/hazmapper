import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmationBodyComponent } from './modal-confirmation-body.component';

describe('ModalConfirmationBodyComponent', () => {
  let component: ModalConfirmationBodyComponent;
  let fixture: ComponentFixture<ModalConfirmationBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalConfirmationBodyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmationBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
