import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewLogsComponent } from './streetview-logs.component';

describe('StreetviewLogsComponent', () => {
  let component: StreetviewLogsComponent;
  let fixture: ComponentFixture<StreetviewLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreetviewLogsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
