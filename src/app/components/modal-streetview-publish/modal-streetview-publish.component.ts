import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation/modal';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { Subject } from 'rxjs';
import { StreetviewService } from '../../services/streetview.service';
import { StreetviewAuthenticationService } from '../../services/streetview-authentication.service';
import { TapisFilesService } from '../../services/tapis-files.service';

@Component({
  selector: 'app-modal-streetview-publish',
  templateUrl: './modal-streetview-publish.component.html',
  styleUrls: ['./modal-streetview-publish.component.styl']
})
export class ModalStreetviewPublishComponent implements OnInit {
  // @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_FEATURE_TYPES;
  @Input() single: true;
  @Input() allowFolders: true;
  selectedFiles: Array<RemoteFile> = [];
  // TODO Type
  public onClose: Subject<any> = new Subject<any>();

  publishToMapillary: boolean = false;
  publishToGoogle: boolean = false;
  publishErrorMessage: string = "";

  constructor(public bsModalRef: BsModalRef,
              private streetviewService: StreetviewService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
              private tapisFilesService: TapisFilesService) { }

  ngOnInit() {
    this.publishErrorMessage = "";
    // this.streetviewService.streetviewAuthStatus.subscribe((next: StreetviewAuthentication) => {
    //   this.streetviewAuth = next;
    // });
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
      publishToMapillary: this.publishToMapillary,
      publishToGoogle: this.publishToGoogle
    });
    this.bsModalRef.hide();
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }
}
