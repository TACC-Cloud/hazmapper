import { Component, OnInit, OnDestroy } from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import { Project } from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {NotificationsService} from '../../services/notifications.service';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthentication, StreetviewTokens} from '../../models/streetview';
import {ProjectsService} from '../../services/projects.service'
import {ModalStreetviewPublishComponent} from '../modal-streetview-publish/modal-streetview-publish.component';
import { IProgressNotification } from 'src/app/models/notification';
import { ModalStreetviewLogComponent } from '../modal-streetview-log/modal-streetview-log.component';

@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit, OnDestroy {

  private activeProject: Project;
  private currentUser: AuthenticatedUser;
  private timerSub: any;
  private progressNotifications: Array<IProgressNotification> = [];
  private mapillarySequences: Array<any> = [];
  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private authService: AuthService,) { }

  ngOnInit() {
    this.streetviewService.streetviewSequences.subscribe((next) => {
      // TODO Fix this to be more elegant (way to toggle switch)
      next.forEach(x => x.open = false);
      this.mapillarySequences = next;
    })

    this.authService.currentUser.subscribe( (next) => {
      this.currentUser = next;
    });

    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    // TODO: Maybe move this somehwere else since it is triggered every switch
    // Or maybe this is necessary...
    this.streetviewService.login('google', this.activeProject.id, this.currentUser.username, false);
    this.streetviewService.login('mapillary', this.activeProject.id, this.currentUser.username, false);
    this.streetviewService.getStreetviewSequences('mapillary', this.activeProject.id, this.currentUser.username);
    this.notificationsService.getRecentProgress();
    this.timerSub = this.notificationsService.initProgressPoll();
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    modal.content.onClose.subscribe( (publishData: any) => {
      this.streetviewService.uploadPathToStreetviewService(this.activeProject.id, this.currentUser.username, publishData.selectedPath, publishData.publishToMapillary, publishData.publishToGoogle);
    });
  }

  // TODO: Fix so that it is considers incremental retry
  retryPublish(pn: IProgressNotification) {
    let retry = pn.message == "From tapis" ? false : true
    this.streetviewService.uploadPathToStreetviewService(this.activeProject.id,
                                                         this.currentUser.username,
                                                         {
                                                           system: pn.extraData.publishInfo.system,
                                                           path: pn.extraData.publishInfo.path
                                                         },
                                                         pn.extraData.publishInfo.mapillary,
                                                         pn.extraData.publishInfo.google,
                                                         retry);
  }

  login(svService: string) {
    this.streetviewService.login(svService, this.activeProject.id, this.currentUser.username, true);
  }

  logout(svService: string) {
    this.streetviewService.logout(svService, this.activeProject.id, this.currentUser.username);
  }

  isLoggedIn(svService: string) {
    return this.streetviewService.getLocalToken(svService);
  }

  toggleSequence(seqId: number) {
    // let seq = this.mapillarySequences.find(e => e.id = seqId);
    let seq = this.mapillarySequences[seqId];
    seq.open = !seq.open;
  }

  deleteDoneLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  // This should also delete files (maybe it should automatically be handled[in geoapi].. idk)
  deleteErrorLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  openDetailLogModal(pn: IProgressNotification) {
    const initialState = {
      notification: pn
    };
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLogComponent, {initialState});
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}
