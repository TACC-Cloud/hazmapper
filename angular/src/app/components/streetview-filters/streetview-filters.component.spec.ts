import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewFiltersComponent } from './streetview-filters.component';

describe('StreetviewFiltersComponent', () => {
  let component: StreetviewFiltersComponent;
  let fixture: ComponentFixture<StreetviewFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
