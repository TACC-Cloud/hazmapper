import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { RemoteFile } from 'ng-tapis/models/remote-file';
import { Subject } from 'rxjs';
import { StreetviewAuthenticationService } from '../../services/streetview-authentication.service';
import { Streetview } from 'src/app/models/streetview';

@Component({
  selector: 'app-modal-streetview-publish',
  templateUrl: './modal-streetview-publish.component.html',
  styleUrls: ['./modal-streetview-publish.component.styl'],
})
export class ModalStreetviewPublishComponent implements OnInit {
  @Input() single: true;
  @Input() allowFolders: true;
  selectedFiles: Array<RemoteFile> = [];
  selectedOrganization = '';
  public onClose: Subject<any> = new Subject<any>();
  publishErrorMessage = '';
  activeStreetview: Streetview;

  constructor(
    public bsModalRef: BsModalRef,
    private streetviewAuthenticationService: StreetviewAuthenticationService
  ) {}

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe(
      (sv: Streetview) => {
        this.activeStreetview = sv;
        this.selectedOrganization = sv.organizations[0].key;
      }
    );
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
    });
    this.bsModalRef.hide();
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }
}
