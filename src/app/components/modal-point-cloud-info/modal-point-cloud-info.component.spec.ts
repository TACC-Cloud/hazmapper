import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPointCloudInfoComponent } from './modal-point-cloud-info.component';

describe('ModalPointCloudInfoComponent', () => {
  let component: ModalPointCloudInfoComponent;
  let fixture: ComponentFixture<ModalPointCloudInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPointCloudInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPointCloudInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
