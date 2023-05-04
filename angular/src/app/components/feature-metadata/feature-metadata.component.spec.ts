import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { featureFixture } from '../../fixtures/feature.fixture';
import { FeatureMetadataComponent } from './feature-metadata.component';

describe('FeatureMetadataComponent', () => {
  let component: FeatureMetadataComponent;
  let fixture: ComponentFixture<FeatureMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureMetadataComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureMetadataComponent);
    component = fixture.componentInstance;
    component.feature = featureFixture;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
