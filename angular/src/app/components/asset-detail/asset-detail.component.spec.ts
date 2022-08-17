import { async, ComponentFixture, TestBed} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA} from "@angular/core";
import { AssetDetailComponent } from './asset-detail.component';
import {GeoDataService} from "../../services/geo-data.service";
import {Feature, IFeatureAsset} from "../../models/models";
import {of, Observable} from "rxjs";

class MockData {
  get activeFeature() {return 1}
}

describe('AssetDetailComponent', () => {
  let component: AssetDetailComponent;
  let fixture: ComponentFixture<AssetDetailComponent>;
  let element: HTMLElement;
  let serviceMock: jasmine.SpyObj<GeoDataService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetDetailComponent ],
      providers: [ {
        provide: GeoDataService,
        useClass: MockData
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDetailComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    serviceMock = TestBed.get(GeoDataService)

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a label header with id', () => {
    spyOnProperty(serviceMock, 'activeFeature', 'get').and.returnValue(
      of(new Feature( {
        id: 1,
        type: "Feature",
        geometry: {type: "Point", coordinates: [0,0]},
        properties: {},
        assets: []
      }))
    );
    fixture.detectChanges();
    expect(element.querySelector('.feature-label').innerHTML).toContain('1')
  });

  it('should have a label header with label property', () => {
    spyOnProperty(serviceMock, 'activeFeature', 'get').and.returnValue(
      of(new Feature( {
        id: 1,
        type: "Feature",
        geometry: {type: "Point", coordinates: [0,0]},
        properties: {label: 'Test Label'},
        assets: []
      }))
    );
    fixture.detectChanges();
    expect(element.querySelector('.feature-label').innerHTML).toContain('Test Label')
  });
});
