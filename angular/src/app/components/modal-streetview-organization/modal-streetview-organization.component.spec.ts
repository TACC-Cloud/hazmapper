import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewOrganizationComponent } from './modal-streetview-organization.component';

describe('ModalStreetviewOrganizationComponent', () => {
  let component: ModalStreetviewOrganizationComponent;
  let fixture: ComponentFixture<ModalStreetviewOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStreetviewOrganizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
