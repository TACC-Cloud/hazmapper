import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreetviewPublishComponent } from './modal-streetview-publish.component';

describe('ModalStreetviewPublishComponent', () => {
  let component: ModalStreetviewPublishComponent;
  let fixture: ComponentFixture<ModalStreetviewPublishComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStreetviewPublishComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStreetviewPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
