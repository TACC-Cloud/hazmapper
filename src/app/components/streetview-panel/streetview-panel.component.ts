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
import { ModalStreetviewLinkComponent } from '../modal-streetview-link/modal-streetview-link.component';
import {ModalStreetviewUsernameComponent} from '../modal-streetview-username/modal-streetview-username.component';


@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit {

  private publishingStreetview = false;
  private progressNotifications: Array<IProgressNotification> = [];
  private streetviews: Streetview[];
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
    // TODO: Get this working? This should just work through interceptors
    // if (this.streetviewAuthenticationService.isLoggedIn('mapillary')) {
    //   this.streetviewAuthenticationService.setRemoteToken('mapillary');
    // }

    this.streetviewAuthenticationService.getStreetviews().subscribe(resp => {
      this.streetviews = resp;
    });

    this.streetviewService.displayStreetview.subscribe(display => {
      this.displayStreetview = display;
    });

    // this.streetviewService.getMapillaryTiles();
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
        'mapillary');
    });
  }

  openStreetviewUsernameModal(service: string) {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewUsernameComponent);
    modal.content.onClose.subscribe((data: any) => {
      this.streetviewAuthenticationService.updateStreetviewByService(
        service, 
        {service_user: data.username}
      ).subscribe();
    });
  }

  // openStreetviewLinkModal() {
  //   const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLinkComponent);
  //   modal.content.onClose.subscribe( (linkData: any) => {
  //     this.streetviewService.addSequenceToPath(linkData.service,
  //                                              linkData.sequences,
  //                                              linkData.selectedPath);
  //   });
  // }

  login(svService: string) {
    this.streetviewAuthenticationService.login(svService);
  }

  logout(svService: string) {
    this.streetviewAuthenticationService.logout(svService);
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }

  testStreetview() {
    this.streetviewService.testRequest();
  }

  toggleStreetviewDisplay() {
    this.streetviewService.displayStreetview = !this.displayStreetview;
  }

}
