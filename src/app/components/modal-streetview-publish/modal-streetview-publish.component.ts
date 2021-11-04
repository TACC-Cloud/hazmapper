import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { Subject } from 'rxjs';
import { StreetviewAuthenticationService } from '../../services/streetview-authentication.service';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-modal-streetview-publish',
  templateUrl: './modal-streetview-publish.component.html',
  styleUrls: ['./modal-streetview-publish.component.styl']
})
export class ModalStreetviewPublishComponent implements OnInit {
  @Input() single: true;
  @Input() allowFolders: true;
  selectedFiles: Array<RemoteFile> = [];
  selectedOrganization = '';
  public onClose: Subject<any> = new Subject<any>();
  publishToMapillary = true;
  publishToGoogle = false;
  publishErrorMessage = '';
  organizations = [];

  constructor(public bsModalRef: BsModalRef,
              private streetviewService: StreetviewService,
              private streetviewAuthenticationService: StreetviewAuthenticationService) { }

  ngOnInit() {
    this.streetviewAuthenticationService.organizations.subscribe(o => {
      this.organizations = o;
    });
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  cancel() {
    this.bsModalRef.hide();
  }

  publish() {
    this.onClose.next({
      selectedPath: this.selectedFiles[0],
      selectedOrganization: this.selectedOrganization,
      publishToMapillary: this.publishToMapillary,
      publishToGoogle: this.publishToGoogle,
    });
    this.bsModalRef.hide();
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }
}
