import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { featureFixture } from '../../fixtures/feature.fixture';
import { FeatureRowComponent } from './feature-row.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FeatureRowComponent', () => {
  let component: FeatureRowComponent;
  let fixture: ComponentFixture<FeatureRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureRowComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureRowComponent);
    component = fixture.componentInstance;
    component.feature = featureFixture;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
