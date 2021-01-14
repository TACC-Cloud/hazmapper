import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewMapillaryCallbackComponent } from './streetview-mapillary-callback.component';

describe('StreetviewMapillaryCallbackComponent', () => {
  let component: StreetviewMapillaryCallbackComponent;
  let fixture: ComponentFixture<StreetviewMapillaryCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewMapillaryCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewMapillaryCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
