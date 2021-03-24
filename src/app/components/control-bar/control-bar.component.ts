import { Component, Input, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {NotificationsService} from '../../services/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {
  public activeProject: Project;
  public mapMouseLocation: LatLng = new LatLng(0, 0);
  public loadingProject = false;
  public loadingProjectFailed = false;
  private loadingData = false;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              private router: Router,
              ) { }

  ngOnInit() {
    this.projectsService.loadingProject.subscribe(value => this.loadingProject = value);
    this.projectsService.loadingProjectFailed.subscribe(value => this.loadingProjectFailed = value);

    combineLatest(this.geoDataService.loadingOverlayData,
                  this.geoDataService.loadingPointCloudData,
                  this.geoDataService.loadingFeatureData)
      .subscribe(([loadingOverlay, loadingPointCloud, loadingFeature]) => {
        // They are running
        if (!(loadingOverlay || loadingPointCloud || loadingFeature)) {
          this.loadingData = false;
        } else {
          this.loadingData = true;
        }
      });

    this.projectsService.activeProject.subscribe(next => {
      this.activeProject = next;
      if (this.activeProject) {
        this.geoDataService.getDataForProject(next.id);
      } else {
        this.geoDataService.clearData();
      }
    });

    this.notificationsService.notifications.subscribe(next => {
      const hasSuccessNotification = next.some(note => note.status === 'success');
      if (hasSuccessNotification) {
        this.geoDataService.getDataForProject(this.activeProject.id);
      }
    });

    this.geoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next) => {
      this.mapMouseLocation = next;
    });
  }
}
