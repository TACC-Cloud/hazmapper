import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AssetsPanelComponent } from './assets-panel.component';
import { GeoDataService } from '../../services/geo-data.service';

class MockData {}

describe('AssetsPanelComponent', () => {
  let component: AssetsPanelComponent;
  let fixture: ComponentFixture<AssetsPanelComponent>;
  let serviceMock: jasmine.SpyObj<GeoDataService>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssetsPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: GeoDataService,
          useClass: MockData,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsPanelComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    serviceMock = TestBed.get(GeoDataService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: Add more tests
});
