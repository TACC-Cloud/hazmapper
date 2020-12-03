import {Component, Input, OnInit} from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip} from 'rxjs/operators';
import {BsModalService} from 'ngx-foundation';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import { combineLatest } from 'rxjs';
import {NotificationsService} from '../../services/notifications.service';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {
  @Input() publicMap = false;
  public projects: Project[] = [];
  public selectedProject: Project;
  public mapMouseLocation: LatLng = new LatLng(0, 0);
  private loading = true;
  private loadingData = false;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private notificationsService: NotificationsService,
              private bsModalService: BsModalService,
              private route: ActivatedRoute,
              private router: Router
              ) { }

  ngOnInit() {
    const activeProjectId = this.route.snapshot.paramMap.get('id');

    if (this.publicMap) {
      this.projectsService.setActiveProjectId(activeProjectId);
    } else {
      // TODO add suport for map route for non-public maps

      this.projectsService.getProjects();
      this.projectsService.projects.subscribe((projects) => {
        this.projects = projects;
        this.loading = false;
        const validSelectedProject = this.selectedProject && projects.some(proj => proj.id === this.selectedProject.id);
        if (!validSelectedProject && this.projects.length) {
          this.selectProject(this.projects[0]);
        } else if (!validSelectedProject && this.selectedProject) {
          this.selectProject(null);
        }
      });
    }

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
      this.selectedProject = next;
      if (this.selectedProject) {
        this.geoDataService.getDataForProject(next.id);
      } else {
        this.geoDataService.clearData();
      }
    });

    this.notificationsService.notifications.subscribe(next => {
      const hasSuccessNotification = next.some(note => note.status === 'success');
      if (hasSuccessNotification) {
        this.geoDataService.getDataForProject(this.selectedProject.id);
      }
    });

    this.geoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next) => {
      this.mapMouseLocation = next;
    });
  }

  selectProject(p: Project): void {
    this.projectsService.setActiveProject(p);
  }

  openCreateProjectModal() {
    this.bsModalService.show(ModalCreateProjectComponent);
  }

}
