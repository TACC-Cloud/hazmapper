import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewLinkComponent } from './modal-streetview-link.component';

describe('ModalStreetviewLinkComponent', () => {
  let component: ModalStreetviewLinkComponent;
  let fixture: ComponentFixture<ModalStreetviewLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStreetviewLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
