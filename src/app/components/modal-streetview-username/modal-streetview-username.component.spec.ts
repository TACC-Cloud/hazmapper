import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewUsernameComponent } from './modal-streetview-username.component';

describe('ModalStreetviewUsernameComponent', () => {
  let component: ModalStreetviewUsernameComponent;
  let fixture: ComponentFixture<ModalStreetviewUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStreetviewUsernameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
