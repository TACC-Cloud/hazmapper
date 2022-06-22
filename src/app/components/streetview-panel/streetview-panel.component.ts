import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { Streetview } from '../../models/streetview';
import { StreetviewService } from '../../services/streetview.service';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ModalStreetviewPublishComponent } from '../modal-streetview-publish/modal-streetview-publish.component';
import { ModalService } from 'src/app/services/modal.service';
import { ModalStreetviewUsernameComponent } from '../modal-streetview-username/modal-streetview-username.component';
import { ModalStreetviewOrganizationComponent } from '../modal-streetview-organization/modal-streetview-organization.component';
import { ProjectsService } from 'src/app/services/projects.service';
import { Project } from 'src/app/models/models';

@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl'],
})
export class StreetviewPanelComponent implements OnInit {
  @Input() isPublicView;
  private activeStreetview: Streetview;
  private activeProject: Project;
  private displayStreetview = false;

  constructor(
    private bsModalService: BsModalService,
    private streetviewService: StreetviewService,
    private modalService: ModalService,
    private projectsService: ProjectsService,
    private streetviewAuthenticationService: StreetviewAuthenticationService
  ) {}

  ngOnInit() {
    this.streetviewService.displayStreetview.subscribe((display: boolean) => {
      this.displayStreetview = display;
    });

    this.streetviewAuthenticationService.activeStreetview.subscribe(
      (sv: Streetview) => {
        this.activeStreetview = sv;
      }
    );

    this.projectsService.activeProject.subscribe((project: Project) => {
      this.activeProject = project;
    });
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(
      ModalStreetviewPublishComponent
    );
    modal.content.onClose.subscribe((publishData: any) => {
      this.streetviewService.publishPathToStreetviewService(
        publishData.selectedPath,
        publishData.selectedOrganization,
        'mapillary'
      );
    });
  }

  openStreetviewUsernameModal(service: string) {
    const modal: BsModalRef = this.bsModalService.show(
      ModalStreetviewUsernameComponent
    );
    modal.content.onClose.subscribe((data: any) => {
      this.streetviewAuthenticationService.updateStreetviewByService(service, {
        service_user: data.username,
      });
    });
  }

  openStreetviewOrganizationModal() {
    this.bsModalService.show(ModalStreetviewOrganizationComponent);
  }

  login(svService: string) {
    this.streetviewAuthenticationService.login(
      svService,
      this.activeProject.id,
      this.isPublicView
    );
  }

  logout(svService: string) {
    this.streetviewAuthenticationService.logout(svService);
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(
      svService,
      this.isPublicView
    );
  }

  toggleStreetviewDisplay() {
    this.streetviewService.displayStreetview = !this.displayStreetview;
  }

  openDeleteStreetviewModal(service: string) {
    this.modalService
      .confirm(
        'Delete streetview service',
        'Are you sure you want to delete this streetview service? \
        This will delete all the service user information stored including sequence \
        assets and upload data. Only confirm if you are ok with losing all associated data!',
        ['Cancel', 'Confirm']
      )
      .subscribe((answer) => {
        if (answer === 'Confirm') {
          this.streetviewAuthenticationService.deleteStreetviewByService(
            service
          );
        }
      });
  }
}
