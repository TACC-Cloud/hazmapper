import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip} from 'rxjs/operators';
import {combineLatest, Subscription} from 'rxjs';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import {NotificationsService} from '../../services/notifications.service';
import {BsModalService} from 'ngx-foundation';
import { Router, ActivatedRoute } from '@angular/router';
import {MAIN} from '../../constants/routes';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit, OnDestroy {
  @Input() isPublicView = false;
  public projects: Project[] = [];
  private subscription: Subscription = new Subscription();
  private activeProject: Project;
  private mapMouseLocation: LatLng = new LatLng(0, 0);
  private loadingActiveProject = true;
  private loadingActiveProjectFailed = false;
  private loadingData = false;
  private loading = true;
  public selectedProject: Project;

  constructor(private projectsService: ProjectsService,
              private router: Router,
              private route: ActivatedRoute,
              private geoDataService: GeoDataService,
              private bsModalService: BsModalService,
              private notificationsService: NotificationsService,
              ) { }

  ngOnInit() {
    this.projectsService.getProjects();
    this.subscription.add(this.projectsService.loadingActiveProject.subscribe(
      value => this.loadingActiveProject = value));
    this.subscription.add(this.projectsService.loadingActiveProjectFailed.subscribe(value => this.loadingActiveProjectFailed = value));

    this.subscription.add(this.projectsService.projects.subscribe( (projects) => {
      this.projects = projects;
      this.loading = false;
      const validSelectedProject = this.selectedProject && projects.some(proj => proj.id === this.selectedProject.id);
      if (!validSelectedProject && this.projects.length) {
        this.selectProject(this.projects[0]);
      } else if (!validSelectedProject && this.selectedProject) {
        this.selectProject(null);
      }
    }));

    this.subscription.add(combineLatest([this.geoDataService.loadingOverlayData,
                  this.geoDataService.loadingPointCloudData,
                  this.geoDataService.loadingFeatureData])
      .subscribe(([loadingOverlay, loadingPointCloud, loadingFeature]) => {
        // They are running
        this.loadingData = (loadingOverlay || loadingPointCloud || loadingFeature);
      }));

    this.subscription.add(this.projectsService.activeProject.subscribe(next => {
      this.activeProject = next;
      if (this.activeProject) {
        this.geoDataService.getDataForProject(next.id, this.isPublicView);
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

  routeToMain() {
     this.router.navigateByUrl(MAIN);
  }

  selectProject(p: Project): void {
    this.projectsService.setActiveProject(p);
  }

  routeToProject(projectUUID: string) {
    this.projectsService.setActiveProjectUUID(projectUUID);
  }

  openCreateProjectModal() {
    const modal = this.bsModalService.show(ModalCreateProjectComponent);
    modal.content.onClose.subscribe( (project) => {
      this.routeToProject(project.uuid);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
