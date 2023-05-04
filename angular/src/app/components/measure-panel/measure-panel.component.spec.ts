import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurePanelComponent } from './measure-panel.component';

describe('MeasurePanelComponent', () => {
  let component: MeasurePanelComponent;
  let fixture: ComponentFixture<MeasurePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasurePanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
