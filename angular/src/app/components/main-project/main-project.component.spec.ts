import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainProjectComponent } from './main-project.component';

import {GeoDataService} from '../../services/geo-data.service';
import {instance, mock, when} from 'ts-mockito';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {FeatureCollection} from '../../models/models';
import {featureFixture} from '../../fixtures/feature.fixture';
import {userFixture} from '../../fixtures/user.fixture';


describe('MainProjectComponent', () => {
  let component: MainProjectComponent;
  let fixture: ComponentFixture<MainProjectComponent>;

  const MockData: GeoDataService = mock(GeoDataService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainProjectComponent ],
      providers: [
        {
          provide: GeoDataService, useFactory: () => instance(MockData)
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainProjectComponent);
    component = fixture.componentInstance;
    when(MockData.activeFeature).thenReturn(of(featureFixture));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
