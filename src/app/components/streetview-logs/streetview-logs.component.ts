import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProgressNotification } from 'src/app/models/notification';
import { NotificationsService } from '../../services/notifications.service';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { StreetviewService } from 'src/app/services/streetview.service';
import { ModalStreetviewLogComponent } from '../modal-streetview-log/modal-streetview-log.component';

@Component({
  selector: 'app-streetview-logs',
  templateUrl: './streetview-logs.component.html',
  styleUrls: ['./streetview-logs.component.styl']
})
export class StreetviewLogsComponent implements OnInit, OnDestroy {
  private progressNotifications: Array<IProgressNotification> = [];
  private timerSub: any;

  constructor(private notificationsService: NotificationsService,
              private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
             ) { }

  ngOnInit() {
    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
    });
    this.notificationsService.getRecentProgress();
    this.timerSub = this.notificationsService.initProgressPoll();
  }


  // TODO: Fix so that it is considers incremental retry
  retryPublish(pn: IProgressNotification) {
    let retry = pn.message == "From tapis" ? false : true
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

  deleteErrorLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

}
