import { Component, OnInit } from '@angular/core';
// import {GeoDataService} from '../../services/geo-data.service';
// import {Feature} from '../../models/models';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {Observable} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import {RemoteFile} from 'ng-tapis';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.styl']
})
export class MainComponent implements OnInit {
  public currentUser: AuthenticatedUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService, private bsModalService: BsModalService,) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(next => this.currentUser = next);
  }

  routeToWelcome() {
    this.router.navigate([''], { relativeTo: this.route });
  }
}
