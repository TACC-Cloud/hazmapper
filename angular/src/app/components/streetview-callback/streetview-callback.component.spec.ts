import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewCallbackComponent } from './streetview-callback.component';

describe('StreetviewCallbackComponent', () => {
  let component: StreetviewCallbackComponent;
  let fixture: ComponentFixture<StreetviewCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreetviewCallbackComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
