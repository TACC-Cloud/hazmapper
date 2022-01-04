import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip, take} from 'rxjs/operators';
import {combineLatest, Subscription} from 'rxjs';
import {NotificationsService} from '../../services/notifications.service';
import {MAIN} from '../../constants/routes';
import {Router} from '@angular/router';
import {AuthService} from '../../services/authentication.service';
import { AgaveSystemsService } from 'src/app/services/agave-systems.service';

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
  private canSwitchToPrivateMap = false;

  constructor(private router: Router,
              private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private notificationsService: NotificationsService,
              private authService: AuthService,
              private agaveSystemsService: AgaveSystemsService
              ) { }

  ngOnInit() {
    this.projectsService.getProjects();
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

    this.subscription.add(this.projectsService.activeProject.subscribe(activeProject => {
      if (activeProject) {
        this.geoDataService.getDataForProject(activeProject.id, this.isPublicView);
        this.activeProject = activeProject;
      } else {
        this.geoDataService.clearData();
      }
    }));

    this.subscription.add(combineLatest([this.authService.currentUser,
      this.projectsService.projectUsers$])
      .subscribe(([currentUser, projectUsers]) => {
        // check if user is logged in viewing a public map but is allowed to switch to private view
        if (this.isPublicView && projectUsers) {
          this.canSwitchToPrivateMap = projectUsers.find(u => u.username === currentUser.username) ? true : false;
        } else {
          this.canSwitchToPrivateMap = false;
        }
      }));

    this.subscription.add(this.notificationsService.notifications.subscribe(next => {
      const hasSuccessNotification = next.some(note => note.status === 'success');
      if (hasSuccessNotification) {
        this.geoDataService.getDataForProject(this.activeProject.id, false);
      }
    }));

    this.subscription.add(this.geoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next) => {
      this.mapMouseLocation = next;
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  routeToPrivateView() {
    this.router.navigate(['project', this.activeProject.uuid]);
  }
}
