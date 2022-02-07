import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { IProgressNotification } from 'src/app/models/notification';
import {NotificationsService} from '../../services/notifications.service';
import {Project} from '../../models/models';
import { Streetview } from '../../models/streetview';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthenticationService} from 'src/app/services/streetview-authentication.service';
import {AuthService} from 'src/app/services/authentication.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { ModalStreetviewPublishComponent } from '../modal-streetview-publish/modal-streetview-publish.component';
import {ModalStreetviewUsernameComponent} from '../modal-streetview-username/modal-streetview-username.component';
import {ModalStreetviewOrganizationComponent} from '../modal-streetview-organization/modal-streetview-organization.component';


@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit {

  private publishingStreetview = false;
  private progressNotifications: Array<IProgressNotification> = [];
  private activeStreetview: Streetview;
  private hasService = false;
  private displayStreetview = false;

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private authService: AuthService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
             ) { }

  ngOnInit() {
    this.streetviewService.displayStreetview.subscribe(display => {
      this.displayStreetview = display;
    });

    this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
    });

    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
      this.publishingStreetview = (next.length > 0);
    });
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    modal.content.onClose.subscribe( (publishData: any) => {
      this.streetviewService.uploadPathToStreetviewService(publishData.selectedPath,
                                                           publishData.selectedOrganization,
                                                           'mapillary');
    });
  }

  openStreetviewUsernameModal(service: string) {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewUsernameComponent);
    modal.content.onClose.subscribe((data: any) => {
      this.streetviewAuthenticationService.updateStreetviewByService(
        service, 
        {service_user: data.username}
      );
    });
  }

  openStreetviewOrganizationModal() {
    this.bsModalService.show(ModalStreetviewOrganizationComponent);
  }

  login(svService: string) {
    this.streetviewAuthenticationService.login(svService);
  }

  logout(svService: string) {
    this.streetviewAuthenticationService.logout(svService);
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }

  toggleStreetviewDisplay() {
    this.streetviewService.displayStreetview = !this.displayStreetview;
  }

}
