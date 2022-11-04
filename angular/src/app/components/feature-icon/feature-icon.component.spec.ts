import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {FeatureIconComponent} from './feature-icon.component';
import {Feature, IFeatureAsset} from "../../models/models";

describe('FeatureIconComponent', () => {
  let component: FeatureIconComponent;
  let fixture: ComponentFixture<FeatureIconComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureIconComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureIconComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an image icon', () => {
    component.feature = new Feature({
      type: "Feature",
      geometry: {type: 'Point', coordinates: [0, 0]},
      properties: {},
      assets: [<IFeatureAsset>{asset_type: 'image'}]
    });
    fixture.detectChanges();
    const i = element.querySelector('i');
    expect(i.classList).toContain('fa-camera-retro');
  });

  it('should render an video icon', () => {
    component.feature = new Feature({
      type: "Feature",
      geometry: {type: 'Point', coordinates: [0, 0]},
      properties: {},
      assets: [<IFeatureAsset>{asset_type: 'video'}]
    });
    fixture.detectChanges();
    const i = element.querySelector('i');
    expect(i.classList).toContain('fa-video');
  });
});

