import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureGeometryComponent } from './feature-geometry.component';

describe('FeatureGeometryComponent', () => {
  let component: FeatureGeometryComponent;
  let fixture: ComponentFixture<FeatureGeometryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureGeometryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
