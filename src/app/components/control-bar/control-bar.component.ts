import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip} from 'rxjs/operators';
import {combineLatest, Subscription} from 'rxjs';
import {NotificationsService} from '../../services/notifications.service';
import { ModalFileBrowserComponent } from '../modal-file-browser/modal-file-browser.component';
import { ModalLinkProjectComponent } from '../modal-link-project/modal-link-project.component';
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
  modalRef: BsModalRef;

  constructor(private projectsService: ProjectsService,
              private bsModalService: BsModalService,
              private geoDataService: GeoDataService,
              private notificationsService: NotificationsService,
              private agaveSystemsService: AgaveSystemsService
              ) { }

  ngOnInit() {
    this.agaveSystemsService.list();

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

    this.subscription.add(combineLatest([this.projectsService.activeProject,
                                         this.agaveSystemsService.projects])
      .subscribe(([activeProject, dsProjects]) => {
        if (activeProject) {
          this.geoDataService.getDataForProject(activeProject.id, this.isPublicView);
          this.activeProject = this.agaveSystemsService.getDSProjectInformation([activeProject], dsProjects)[0];
        } else {
          this.geoDataService.clearData();
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
}
