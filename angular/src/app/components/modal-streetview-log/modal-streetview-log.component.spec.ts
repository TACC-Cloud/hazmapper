import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewLogComponent } from './modal-streetview-log.component';

describe('ModalStreetviewLogComponent', () => {
  let component: ModalStreetviewLogComponent;
  let fixture: ComponentFixture<ModalStreetviewLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStreetviewLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
