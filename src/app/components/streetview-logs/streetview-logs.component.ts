import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProgressNotification } from 'src/app/models/notification';
import {NotificationsService} from '../../services/notifications.service';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import { StreetviewService } from 'src/app/services/streetview.service';
import { Project } from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {ProjectsService} from '../../services/projects.service'
import { ModalStreetviewLogComponent } from '../modal-streetview-log/modal-streetview-log.component';


@Component({
  selector: 'app-streetview-logs',
  templateUrl: './streetview-logs.component.html',
  styleUrls: ['./streetview-logs.component.styl']
})
export class StreetviewLogsComponent implements OnInit, OnDestroy {
  private progressNotifications: Array<IProgressNotification> = [];
  private timerSub: any;
  private activeProject: Project;
  private currentUser: AuthenticatedUser;

  constructor(private notificationsService: NotificationsService,
              private bsModalService: BsModalService,
              private projectsService: ProjectsService,
              private authService: AuthService,
              private streetviewService: StreetviewService,
             ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe( (next) => {
      if (next) {
        this.currentUser = next;
      }
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
    });
    this.notificationsService.getRecentProgress();
    this.timerSub = this.notificationsService.initProgressPoll();
  }


  // TODO: Fix so that it is considers incremental retry
  retryPublish(pn: IProgressNotification) {
    let retry = pn.message == "From tapis" ? false : true
    // this.streetviewService.uploadPathToStreetviewService(this.activeProject.id,
    //                                                      this.currentUser.username,
    //                                                      {
    //                                                        system: pn.extraData.publishInfo.system,
    //                                                        path: pn.extraData.publishInfo.path
    //                                                      },
    //                                                      pn.extraData.publishInfo.mapillary,
    //                                                      pn.extraData.publishInfo.google,
    //                                                      retry);
    this.streetviewService.uploadPathToStreetviewService({
                                                           system: pn.extraData.publishInfo.system,
                                                           path: pn.extraData.publishInfo.path
                                                         },
                                                         pn.extraData.publishInfo.mapillary,
                                                         pn.extraData.publishInfo.google,
                                                         retry);
  }




  openDetailLogModal(pn: IProgressNotification) {
    const initialState = {
      notification: pn
    };
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewLogComponent, {initialState});
  }

  deleteDoneLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  // This should also delete files (maybe it should automatically be handled[in geoapi].. idk)
  deleteErrorLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

}
