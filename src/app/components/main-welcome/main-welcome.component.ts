import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/models';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import { Router, ActivatedRoute } from '@angular/router';
import {Feature} from '../../models/models';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-main-welcome',
  templateUrl: './main-welcome.component.html',
  styleUrls: ['./main-welcome.component.styl']
})

export class MainWelcomeComponent implements OnInit {
  release_url = 'https://github.com/TACC-cloud/hazmapper';
  guide_url = 'https://www.designsafe-ci.org/rw/user-guide/workspace/hazmapper/';

  spinner: boolean;
  connected: boolean;

  public projects: Project[] = [];
  public activeProject: Project;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private geoDataService: GeoDataService,
    private projectsService: ProjectsService,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    this.projectsService.loadingProjects.subscribe((isLoading) => {
      this.spinner = isLoading;
    });

    this.projectsService.loadingProjectsFailed.subscribe((connected) => {
      this.connected = connected;
    });

    this.projectsService.projects.subscribe( (projects) => {
      this.projects = projects;
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.projectsService.getProjects();
  }

  routeToProject(projectId: number) {
    this.router.navigate(['project', projectId], { relativeTo: this.route });
  }

  openCreateProjectModal() {
    const modal = this.bsModalService.show(ModalCreateProjectComponent);
    modal.content.onClose.subscribe( (next) => {
      this.routeToProject(this.activeProject.id);
    });
  }

  deleteProject(p: Project) {
    this.projectsService.deleteProject(p);
  }
}
