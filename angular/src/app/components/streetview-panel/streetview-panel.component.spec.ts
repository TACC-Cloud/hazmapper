import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewPanelComponent } from './streetview-panel.component';

describe('StreetviewPanelComponent', () => {
  let component: StreetviewPanelComponent;
  let fixture: ComponentFixture<StreetviewPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreetviewPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
