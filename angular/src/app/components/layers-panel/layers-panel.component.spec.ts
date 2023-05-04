import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LayersPanelComponent } from './layers-panel.component';
import { GeoDataService } from '../../services/geo-data.service';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { FeatureCollection, Overlay } from '../../models/models';
import { overlayFixture } from '../../fixtures/overlay.fixture';

describe('LayersPanelComponent', () => {
  let component: LayersPanelComponent;
  let fixture: ComponentFixture<LayersPanelComponent>;
  const MockData: GeoDataService = mock(GeoDataService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LayersPanelComponent],
      providers: [
        {
          provide: GeoDataService,
          useFactory: () => instance(MockData),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayersPanelComponent);
    component = fixture.componentInstance;
    when(MockData.basemap).thenReturn(of(new FeatureCollection()));
    when(MockData.overlays).thenReturn(of([overlayFixture]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
