import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateOverlayComponent } from './modal-create-overlay.component';

describe('ModalCreateOverlayComponent', () => {
  let component: ModalCreateOverlayComponent;
  let fixture: ComponentFixture<ModalCreateOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCreateOverlayComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
