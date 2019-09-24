import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DockComponent } from './dock.component';
import {GeoDataService} from "../../services/geo-data.service";
import {instance, mock, when} from "ts-mockito";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {of} from "rxjs";
import {FeatureCollection} from "../../models/models";

describe('DockComponent', () => {
  let component: DockComponent;
  let fixture: ComponentFixture<DockComponent>;
  const MockData: GeoDataService = mock(GeoDataService);
  when(MockData.features).thenReturn(of(
    new FeatureCollection()
  ));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockComponent ],
      providers: [
        {
          provide: GeoDataService, useFactory: ()=> instance(MockData)
        }
      ], schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
