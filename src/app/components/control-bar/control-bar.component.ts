import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import { StreetviewService } from '../../services/streetview.service';
import { LatLng } from 'leaflet';
import { skip } from 'rxjs/operators';
import { combineLatest, Subscription } from 'rxjs';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})

export class ControlBarComponent implements OnInit, OnDestroy {
  @Input() isPublicView = false;
  private subscription: Subscription = new Subscription();
  private activeProject: Project;
  private mapMouseLocation: LatLng = new LatLng(0, 0);
  private loadingActiveProject = true;
  private loadingActiveProjectFailed = false;
  private loadingData = false;
  private streetviewerOpen = false;
  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private notificationsService: NotificationsService,
              private streetviewService: StreetviewService,
              ) { }

  ngOnInit() {
    this.subscription.add(this.projectsService.loadingActiveProject.subscribe(
      value => this.loadingActiveProject = value));
    this.subscription.add(this.projectsService.loadingActiveProjectFailed.subscribe(value => this.loadingActiveProjectFailed = value));

    this.subscription.add(combineLatest([this.geoDataService.loadingOverlayData,
                  this.geoDataService.loadingPointCloudData,
                  this.geoDataService.loadingFeatureData])
      .subscribe(([loadingOverlay, loadingPointCloud, loadingFeature]) => {
        // They are running
        this.loadingData = (loadingOverlay || loadingPointCloud || loadingFeature);
      }));

    this.subscription.add(this.streetviewService.streetviewerOpen.subscribe((next: boolean) => {
      this.streetviewerOpen = next;
    }));

    this.subscription.add(this.projectsService.activeProject.subscribe(next => {
      this.activeProject = next;
      if (this.activeProject) {
        this.geoDataService.getDataForProject(next.id);
      } else {
        this.geoDataService.clearData();
      }
    }));

    this.subscription.add(this.notificationsService.notifications.subscribe(next => {
      const hasSuccessNotification = next.some(note => note.status === 'success');
      if (hasSuccessNotification) {
        this.geoDataService.getDataForProject(this.activeProject.id);
      }
    }));

    this.subscription.add(this.geoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next) => {
      this.mapMouseLocation = next;
    }));
  }

  closeStreetview() {
    this.streetviewService.streetviewerOpener = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
