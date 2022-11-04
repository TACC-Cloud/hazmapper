import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointCloudPanelRowComponent } from './point-cloud-panel-row.component';

describe('PointCloudPanelRowComponent', () => {
  let component: PointCloudPanelRowComponent;
  let fixture: ComponentFixture<PointCloudPanelRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointCloudPanelRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointCloudPanelRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
