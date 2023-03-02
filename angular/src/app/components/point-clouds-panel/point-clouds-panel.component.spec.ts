import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointCloudsPanelComponent } from './point-clouds-panel.component';
import { instance, mock } from 'ts-mockito';
import { GeoDataService } from '../../services/geo-data.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { BsModalService } from 'ngx-foundation';

describe('PointCloudsPanelComponent', () => {
  let component: PointCloudsPanelComponent;
  let fixture: ComponentFixture<PointCloudsPanelComponent>;
  const MockGeoDataService: GeoDataService = mock(GeoDataService);
  const MockProjectsService: ProjectsService = mock(ProjectsService);
  const MockModalService: BsModalService = mock(BsModalService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [PointCloudsPanelComponent],
      providers: [
        {
          provide: GeoDataService,
          useFactory: () => instance(MockGeoDataService),
        },
        {
          provide: ProjectsService,
          useFactory: () => instance(MockProjectsService),
        },
        {
          provide: BsModalService,
          useFactory: () => instance(MockModalService),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointCloudsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
