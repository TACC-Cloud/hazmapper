import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import {LatLng} from 'leaflet';
import {skip} from 'rxjs/operators';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import {interval, Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {

  private REFRESHTIME = 60; // 60 secs per reload
  public projects: Project[];
  public selectedProject: Project;
  public mapMouseLocation: LatLng = new LatLng(0, 0);
  public liveRefresh = false;
  private timer: Observable<number> = interval(this.REFRESHTIME * 1000);
  private timerSubscription: Subscription;

  constructor(private projectsService: ProjectsService,
              private geoDataService: GeoDataService,
              private bsModalService: BsModalService) { }

  ngOnInit() {
    this.projectsService.getProjects();
    this.projectsService.projects.subscribe( (projects) => {
      this.projects = projects;

      if (this.projects.length) {
        this.projectsService.setActiveProject(this.projects[0]);
      }
    });

    this.projectsService.activeProject.subscribe(next => {
      this.selectedProject = next;
      this.getDataForProject(this.selectedProject);
    });

    this.geoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next) => {
      this.mapMouseLocation = next;
    });
    this.timerSubscription = this.timer.subscribe( () => {
      this.reloadFeatures();
    });
  }

  reloadFeatures() {
    this.geoDataService.getFeatures(this.selectedProject.id);
  }

  setLiveRefresh(option: boolean) {
    option ? this.timerSubscription = this.timer.subscribe(() => { this.reloadFeatures(); }) : this.timerSubscription.unsubscribe();
  }

  selectProject(p: Project): void {
    this.projectsService.setActiveProject(p);
    this.getDataForProject(p);
  }

  getDataForProject(p: Project): void {
    this.geoDataService.getFeatures(p.id);
    this.geoDataService.getOverlays(p.id);
    this.geoDataService.getPointClouds(p.id);
  }

  openCreateProjectModal() {
    this.bsModalService.show(ModalCreateProjectComponent);
  }

}
