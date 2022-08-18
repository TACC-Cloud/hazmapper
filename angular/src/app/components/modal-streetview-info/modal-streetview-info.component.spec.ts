import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewInfoComponent } from './modal-streetview-info.component';

describe('ModalStreetviewInfoComponent', () => {
  let component: ModalStreetviewInfoComponent;
  let fixture: ComponentFixture<ModalStreetviewInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalStreetviewInfoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
