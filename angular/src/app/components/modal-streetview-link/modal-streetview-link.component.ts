import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal';
import { RemoteFile } from 'ng-tapis/models/remote-file';
import { Subject } from 'rxjs';
import { StreetviewAuthenticationService } from '../../services/streetview-authentication.service';
import { Streetview } from '../../models/streetview';

@Component({
  selector: 'app-modal-streetview-link',
  templateUrl: './modal-streetview-link.component.html',
  styleUrls: ['./modal-streetview-link.component.styl'],
})
export class ModalStreetviewLinkComponent implements OnInit {
  @Input() single: true;
  @Input() allowFolders: true;
  public onClose: Subject<any> = new Subject<any>();
  selectedFiles: Array<RemoteFile> = [];
  selectedOrganization = '';
  activeStreetview: Streetview;
  linkErrorMessage = '';

  constructor(public bsModalRef: BsModalRef, private streetviewAuthenticationService: StreetviewAuthenticationService) {}

  ngOnInit() {
    this.streetviewAuthenticationService.activeStreetview.subscribe((sv: Streetview) => {
      this.activeStreetview = sv;
      this.selectedOrganization = sv.organizations[0].key;
    });
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  cancel() {
    this.bsModalRef.hide();
  }

  link() {
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
