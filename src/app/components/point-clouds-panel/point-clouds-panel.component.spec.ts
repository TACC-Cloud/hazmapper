import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointCloudsPanelComponent } from './point-clouds-panel.component';

describe('PointCloudsPanelComponent', () => {
  let component: PointCloudsPanelComponent;
  let fixture: ComponentFixture<PointCloudsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointCloudsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointCloudsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
