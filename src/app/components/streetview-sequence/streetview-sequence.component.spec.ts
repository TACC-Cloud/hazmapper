import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewSequenceComponent } from './streetview-sequence.component';

describe('StreetviewSequenceComponent', () => {
  let component: StreetviewSequenceComponent;
  let fixture: ComponentFixture<StreetviewSequenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewSequenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
