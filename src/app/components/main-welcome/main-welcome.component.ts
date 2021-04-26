import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/models';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {BsModalService} from 'ngx-foundation';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmationBodyComponent } from '../modal-confirmation-body/modal-confirmation-body.component';

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

    this.projectsService.getProjects();
  }

  routeToProject(projectId: number) {
    this.router.navigate(['project', projectId], { relativeTo: this.route });
  }

  openCreateProjectModal() {
    this.bsModalService.show(ModalCreateProjectComponent);
  }

  deleteProject(p: Project) {
    this.projectsService.deleteProject(p);
  }

  openDeleteProjectModal(p: Project) {
    let initialState = {
      title: 'Delete Project',
      message: 'Confirm deleting project.',
      options: ['Cancel', 'Confirm']
    };
    if (p.system_path) {
      initialState = {
        title: 'Delete Project',
        message: 'Deleting this project will remove the associated file as well.',
        options: ['Cancel', 'Confirm']
      };
    }
    const modal = this.bsModalService.show(ModalConfirmationBodyComponent, {initialState});
    modal.content.answer.subscribe( (close) => {
      if (close === 'Confirm') {
        this.projectsService.deleteProject(p);
      }
    });
  }
}
