import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLinkProjectComponent } from './modal-link-project.component';

describe('ModalLinkProjectComponent', () => {
  let component: ModalLinkProjectComponent;
  let fixture: ComponentFixture<ModalLinkProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalLinkProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLinkProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
