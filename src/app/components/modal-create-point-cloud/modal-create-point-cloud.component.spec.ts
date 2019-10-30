import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreatePointCloudComponent } from './modal-create-point-cloud.component';

describe('ModalCreatePointCloudComponent', () => {
  let component: ModalCreatePointCloudComponent;
  let fixture: ComponentFixture<ModalCreatePointCloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreatePointCloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreatePointCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
