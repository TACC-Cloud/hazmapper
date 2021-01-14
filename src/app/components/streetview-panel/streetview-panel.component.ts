import { Component, OnInit } from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {StreetviewService} from '../../services/streetview.service';
import {StreetviewAuthentication} from '../../models/streetview';
import {ModalStreetviewPublishComponent} from '../modal-streetview-publish/modal-streetview-publish.component';

@Component({
  selector: 'app-streetview-panel',
  templateUrl: './streetview-panel.component.html',
  styleUrls: ['./streetview-panel.component.styl']
})
export class StreetviewPanelComponent implements OnInit {

  private currentUser: AuthenticatedUser;
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

  streetviewAuth: StreetviewAuthentication;

  constructor(private bsModalService: BsModalService,
              private streetviewService: StreetviewService,
              private authService: AuthService,) { }

  ngOnInit() {
    this.authService.currentUser.subscribe( (next) => {
      this.currentUser = next;
    });

    this.streetviewService.streetviewAuthStatus.subscribe( (next: StreetviewAuthentication) => {
      this.streetviewAuth = next;
    });
  }

  openStreetviewPublishModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalStreetviewPublishComponent);
    // modal.content.onClose.subscribe( (publishData: any) => {
    //   this.streetviewService.publishToStreetview(this.activeProject.id, this.currentUser.username, this.publishData);
    // });
  }

  login(svService: string) {
    this.streetviewService.login(svService);
  }

  logout(svService: string) {
    this.streetviewService.logout(svService);
  }
}
