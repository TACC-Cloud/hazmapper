import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureIconComponent } from './feature-icon.component';

describe('FeatureIconComponent', () => {
  let component: FeatureIconComponent;
  let fixture: ComponentFixture<FeatureIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
