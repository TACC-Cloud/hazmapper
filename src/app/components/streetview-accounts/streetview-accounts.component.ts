import { Component, OnInit } from '@angular/core';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { ModalStreetviewUsernameComponent } from '../modal-streetview-username/modal-streetview-username.component';
import { ModalStreetviewOrganizationComponent } from '../modal-streetview-organization/modal-streetview-organization.component';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { Streetview } from '../../models/streetview';
import { Project } from 'src/app/models/models';

@Component({
  selector: 'app-streetview-accounts',
  templateUrl: './streetview-accounts.component.html',
  styleUrls: ['./streetview-accounts.component.styl']
})
export class StreetviewAccountsComponent implements OnInit {
  activeStreetview: Streetview;
  streetviews: Streetview[];
  activeProject: Project;
  organizations = [];
  constructor(
    private bsModalService: BsModalService,
    private projectsService: ProjectsService,
    private streetviewAuthenticationService: StreetviewAuthenticationService) {}

  ngOnInit() {
    this.streetviewAuthenticationService.streetviews.subscribe(next => {
      this.streetviews = next;
    });

    this.streetviewAuthenticationService.activeStreetview.subscribe((next: Streetview) => {
      this.activeStreetview = next;
    });

    this.projectsService.activeProject.subscribe((project: Project) => {
      this.activeProject = project;
    });
  }

  openStreetviewUsernameModal(service: string) {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewUsernameComponent);
    modal.content.onClose.subscribe((data: any) => {
      this.streetviewAuthenticationService.updateStreetviewByService(service,
        {service_user: data.username}
      );
    });
  }

  openStreetviewOrganizationModal() {
    this.bsModalService.show(ModalStreetviewOrganizationComponent);
  }

  isLoggedIn(service: string) {
    return this.streetviewAuthenticationService.isLoggedIn(service);
  }

  login(service: string) {
    this.streetviewAuthenticationService.login(service, this.activeProject.id);
  }

  logout(service: string) {
    this.streetviewAuthenticationService.logout(service);
  }
}
