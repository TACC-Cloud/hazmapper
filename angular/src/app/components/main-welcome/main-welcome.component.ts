import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/models';
import { Streetview } from '../../models/streetview';
import { ProjectsService, ProjectsData } from '../../services/projects.service';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { AgaveSystemsService } from '../../services/agave-systems.service';
import { ModalCreateProjectComponent } from '../modal-create-project/modal-create-project.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-main-welcome',
  templateUrl: './main-welcome.component.html',
  styleUrls: ['./main-welcome.component.styl'],
})
export class MainWelcomeComponent implements OnInit {
  release_url = 'https://github.com/TACC-cloud/hazmapper';
  guide_url = 'https://www.designsafe-ci.org/rw/user-guides/tools-applications/visualization/hazmapper/';

  loadingProjects = true;

  public projectsData: ProjectsData;

  public activeProject: Project;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private bsModalService: BsModalService,
    private modalService: ModalService,
    private streetviewAuthenticationService: StreetviewAuthenticationService,
    private streetviewService: StreetviewService,
    private agaveSystemsService: AgaveSystemsService
  ) {}

  ngOnInit() {
    this.projectsService.getProjects();
    this.agaveSystemsService.list();
    this.streetviewAuthenticationService.getStreetviews().subscribe();
    this.streetviewAuthenticationService.activeStreetview.subscribe((asv: Streetview) => {
      if (asv) {
        this.streetviewService.activeMapillaryOrganizations = asv.organizations.map((o) => o.key);
      }
    });

    combineLatest([this.projectsService.projectsData, this.agaveSystemsService.projects]).subscribe(([projectsData, dsProjects]) => {
      this.projectsData = projectsData;
      // add extra info from related DS projects
      this.projectsData.projects = this.agaveSystemsService.getProjectMetadata(projectsData.projects, dsProjects);
      this.loadingProjects = false;
    });
  }

  routeToProject(projectUUID: string) {
    this.router.navigate(['project', projectUUID], { relativeTo: this.route });
  }

  openCreateProjectModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateProjectComponent, { class: 'reveal-medium' });
    modal.content.onClose.subscribe((project: Project) => {
      if (project) {
        this.routeToProject(project.uuid);
      }
    });
  }

  openDeleteProjectModal(p: Project, event) {
    event.stopPropagation();
    let message = 'Are you sure you want to delete this map?  All associated features, metadata, and saved files will be deleted.';
    if (p.public) {
      message += ' Note that this is a public map.';
    }
    (message += ' THIS CANNOT BE UNDONE.'),
      this.modalService
        .confirm(
          `Delete map: ${p.name}`,
          // tslint:disable-next-line:max-line-length
          message,
          ['Cancel', 'Delete']
        )
        .subscribe((answer) => {
          if (answer === 'Delete') {
            this.projectsService.deleteProject(p);
          }
        });
  }
}
