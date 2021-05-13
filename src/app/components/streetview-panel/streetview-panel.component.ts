import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { IProgressNotification } from 'src/app/models/notification';
import { NotificationsService } from '../../services/notifications.service';
import { Project } from '../../models/models';
import { StreetviewService } from '../../services/streetview.service';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';
import { ModalStreetviewPublishComponent } from '../modal-streetview-publish/modal-streetview-publish.component';
import { ModalStreetviewLinkComponent } from '../modal-streetview-link/modal-streetview-link.component';


@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit {

  private _activeProjectId: number;
  private username: string;
  private publishingStreetview = false;
  private progressNotifications: Array<IProgressNotification> = [];

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private notificationsService: NotificationsService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
             ) { }

  ngOnInit() {
    if (this.streetviewAuthenticationService.isLoggedIn('mapillary')) {
      this.streetviewAuthenticationService.setRemoteToken('mapillary');
    }

    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
      this.publishingStreetview = (next.length > 0)
    });
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    modal.content.onClose.subscribe( (publishData: any) => {
      this.streetviewService.uploadPathToStreetviewService(publishData.selectedPath,
                                                           publishData.publishToMapillary,
                                                           publishData.publishToGoogle);
    });
  }

  openStreetviewLinkModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLinkComponent);
    modal.content.onClose.subscribe( (linkData: any) => {
      this.streetviewService.addSequenceToPath(linkData.service,
                                               linkData.sequences,
                                               linkData.selectedPath);
    });
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
}
