import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/models';
import {ProjectsService} from '../../services/projects.service';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {ModalCreateProjectComponent} from '../modal-create-project/modal-create-project.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-main-welcome',
  templateUrl: './main-welcome.component.html',
  styleUrls: ['./main-welcome.component.styl']
})

export class MainWelcomeComponent implements OnInit {
  release_url = 'https://github.com/TACC-cloud/hazmapper';
  guide_url = 'https://www.designsafe-ci.org/rw/user-guide/workspace/hazmapper/';

  spinner = true;
  notConnected: boolean;

  public projects = [];
  public activeProject: Project;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private bsModalService: BsModalService,
    private modalService: ModalService,
    private agaveSystemsService: AgaveSystemsService
  ) { }

  ngOnInit() {
    this.projectsService.getProjects();
    this.agaveSystemsService.list();

    this.projectsService.loadingProjectsFailed.subscribe((notConnected) => {
      this.notConnected = notConnected;
    });

    combineLatest(
      this.projectsService.projects,
      this.agaveSystemsService.projects)
        .subscribe(([projects, dsProjects]) => {
          this.projects = this.agaveSystemsService.getDSProjectInformation(projects, dsProjects);
          this.spinner = false;
        });
  }

  routeToProject(projectUUID: string) {
    this.router.navigate(['project', projectUUID], { relativeTo: this.route });
  }

  openCreateProjectModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateProjectComponent);
    modal.content.onClose.subscribe( (project: Project) => {
      if (project) {
        this.routeToProject(project.uuid);
      }
    });
  }

  openDeleteProjectModal(p: Project, event) {
    event.stopPropagation();
    this.modalService.confirm(
      'Delete map',
      // tslint:disable-next-line:max-line-length
      'Are you sure you want to delete this map?  All associated features, metadata, and saved files will be deleted. THIS CANNOT BE UNDONE.',
      ['Cancel', 'Delete']).subscribe( (answer) => {
      if (answer === 'Delete') {
        this.projectsService.deleteProject(p);

      }
    });
  }
}
