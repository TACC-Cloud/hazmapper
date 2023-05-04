import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProgressNotification } from 'src/app/models/notification';
import { NotificationsService } from '../../services/notifications.service';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { ModalStreetviewLogComponent } from '../modal-streetview-log/modal-streetview-log.component';
import { StreetviewAuthenticationService } from 'src/app/services/streetview-authentication.service';

@Component({
  selector: 'app-streetview-logs',
  templateUrl: './streetview-logs.component.html',
  styleUrls: ['./streetview-logs.component.styl'],
})
export class StreetviewLogsComponent implements OnInit, OnDestroy {
  public progressNotifications: Array<IProgressNotification> = [];
  private timerSub: any;

  constructor(
    private notificationsService: NotificationsService,
    private bsModalService: BsModalService,
    private streetviewAuthenticationService: StreetviewAuthenticationService
  ) {}

  ngOnInit() {
    this.notificationsService.progressNotifications.subscribe((next: Array<IProgressNotification>) => {
      this.progressNotifications = next;
      if (next.some((pn) => pn.status === 'success')) {
        this.streetviewAuthenticationService.getStreetviews();
      }
    });
    this.notificationsService.getRecentProgress();
    this.timerSub = this.notificationsService.initProgressPoll();
  }

  openDetailLogModal(pn: IProgressNotification) {
    const initialState = {
      notification: pn,
    };
    this.bsModalService.show(ModalStreetviewLogComponent, { initialState });
  }

  deleteDoneLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  // TODO: Handle this properly by removing session and anything created
  deleteErrorLog(pn: IProgressNotification) {
    this.notificationsService.deleteProgress(pn);
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}
