import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewGoogleCallbackComponent } from './streetview-google-callback.component';

describe('StreetviewGoogleCallbackComponent', () => {
  let component: StreetviewGoogleCallbackComponent;
  let fixture: ComponentFixture<StreetviewGoogleCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewGoogleCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewGoogleCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
