import { Component, OnInit, OnDestroy } from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import { Project } from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {NotificationsService} from '../../services/notifications.service';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthentication, StreetviewTokens} from '../../models/streetview';
import {ProjectsService} from '../../services/projects.service'
import {ModalStreetviewPublishComponent} from '../modal-streetview-publish/modal-streetview-publish.component';

@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit, OnDestroy {

  private activeProject: Project;
  private currentUser: AuthenticatedUser;
  private timer: any;
  uploadLogs: any = [
    {
      name: "Name1",
      dateAdded: "2019-01-01",
      dateDone: "2019-01-02",
      hours: "4",
      user: "Amy",
      status: "failed"
    },
    {
      name: "Name1",
      dateAdded: "2019-01-01",
      dateDone: "2019-01-02",
      hours: "4",
      user: "Amy",
      status: "success"
    },
    {
      name: "Name1",
      dateAdded: "2019-01-01",
      dateDone: "2019-01-02",
      hours: "4",
      user: "Amy",
      status: "success"
    },
    {
      name: "Name1",
      dateAdded: "2019-01-01",
      dateDone: "2019-01-02",
      hours: "4",
      user: "Amy",
      status: "success"
    },
    {
      name: "Name1",
      dateAdded: "2019-01-01",
      dateDone: "2019-01-02",
      hours: "4",
      user: "Amy",
      status: "progress"
    }
  ];


  uploadedImages: any = [
    {
      name: "Name1",
      from: "mapillary",
      geo: "lon: 10; lat: 10"
    },
    {
      name: "Name1",
      from: "mapillary",
      geo: "lon: 10; lat: 10"
    },
    {
      name: "Name1",
      from: "mapillary",
      geo: "lon: 10; lat: 10"
    },
    {
      name: "Name1",
      from: "mapillary",
      geo: "lon: 10; lat: 10"
    },
    {
      name: "Name1",
      from: "mapillary",
      geo: "lon: 10; lat: 10"
    },
  ];

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private authService: AuthService,) { }

  ngOnInit() {
    this.authService.currentUser.subscribe( (next) => {
      this.currentUser = next;
    });
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    // TODO: Maybe move this somehwere else since it is triggered every switch
    // Or maybe this is necessary...
    this.streetviewService.login('google', this.activeProject.id, this.currentUser.username, false);
    this.streetviewService.login('mapillary', this.activeProject.id, this.currentUser.username, false);
    this.timer = this.notificationsService.initProgressPoll();
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

  ngOnDestroy() {
    this.timer.unsubscribe();
  }
}
