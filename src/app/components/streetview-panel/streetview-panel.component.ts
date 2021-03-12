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
  // uploadLogs: any = [
  //   {
  //     name: "/designsafe",
  //     dateAdded: "2019-01-01",
  //     dateDone: "2019-01-02",
  //     hours: "4",
  //     user: "Amy",
  //     status: "failed"
  //   },
  //   {
  //     name: "Name1",
  //     dateAdded: "2019-01-01",
  //     dateDone: "2019-01-02",
  //     hours: "4",
  //     user: "Amy",
  //     status: "success"
  //   },
  //   {
  //     name: "Name1",
  //     dateAdded: "2019-01-01",
  //     dateDone: "2019-01-02",
  //     hours: "4",
  //     user: "Amy",
  //     status: "success"
  //   },
  //   {
  //     name: "Name1",
  //     dateAdded: "2019-01-01",
  //     dateDone: "2019-01-02",
  //     hours: "4",
  //     user: "Amy",
  //     status: "success"
  //   },
  //   {
  //     name: "Name1",
  //     dateAdded: "2019-01-01",
  //     dateDone: "2019-01-02",
  //     hours: "4",
  //     user: "Amy",
  //     status: "progress"
  //   }
  // ];



  // TODO Allow each user to decide the display name of the sequence (in backend as well?)
  mapillarySequences: any = [
    {
      name: "Name1",
      id: 1,
      uuid: "3829-28394-239842-348923",
      from: "mapillary",
      geo: "lon: 10; lat: 10",
      open: false,
      images: [
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
      ]
    },
    {
      name: "Name1",
      id: 2,
      uuid: "839 -2348972-3479-23874-23",
      from: "mapillary",
      geo: "lon: 10; lat: 10",
      open: false,
      images: [
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
      ]
    },
    {
      name: "Name1",
      id: 3,
      from: "mapillary",
      uuid: "839 -2348972-3479-23874-23",
      geo: "lon: 10; lat: 10",
      open: false,
      images: [
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
      ]
    },
    {
      name: "Name1",
      id: 4,
      uuid: "839 -2348972-3479-23874-23",
      from: "mapillary",
      geo: "lon: 10; lat: 10",
      open: false,
      images: [
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
      ]
    },
    {
      name: "Name1",
      from: "mapillary",
      id: 5,
      uuid: "839 -2348972-3479-23874-23",
      geo: "lon: 10; lat: 10",
      open: false,
      images: [
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
        {
          name: "cool",
        },
      ]
    },
  ];

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private authService: AuthService,) { }

  ngOnInit() {
    this.notificationsService.getRecentProgress();
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
    this.timerSub = this.notificationsService.initProgressPoll();
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    modal.content.onClose.subscribe( (publishData: any) => {
      this.streetviewService.uploadPathToStreetviewService(this.activeProject.id, this.currentUser.username, publishData.selectedPath, publishData.publishToMapillary, publishData.publishToGoogle);
    });
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

  ngOnDestroy() {
    // FIXME doesn't work..
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}
