import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-foundation/modal';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { Subject } from 'rxjs';
import { StreetviewService } from '../../services/streetview.service';
import { StreetviewAuthenticationService } from '../../services/streetview-authentication.service';
import { TapisFilesService } from '../../services/tapis-files.service';

@Component({
  selector: 'app-modal-streetview-link',
  templateUrl: './modal-streetview-link.component.html',
  styleUrls: ['./modal-streetview-link.component.styl']
})
export class ModalStreetviewLinkComponent implements OnInit {
  // @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_FEATURE_TYPES;
  @Input() single: true;
  @Input() allowFolders: true;
  selectedFiles: Array<RemoteFile> = [];
  selectedSequences: Array<string> = [];
  private projectId: number;
  private username: string;

  userSequences: Array<any> = [];
  loadingSequences = true;
  loadingMoreSequences = false;

  firstPageLink = "";
  prevPageLink = "";
  nextPageLink = "";
  lastPageLink = "";

  currentPageNumber = 1;
  lastPageNumber = 1;
  // TODO Type
  public onClose: Subject<any> = new Subject<any>();

  currentService: string = 'mapillary';

  publishErrorMessage: string = "";

  constructor(public bsModalRef: BsModalRef,
              private streetviewService: StreetviewService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
              private tapisFilesService: TapisFilesService) { }

  // TODO: In Progress notifier
  ngOnInit() {
    this.streetviewService.clearMapillarySequences();
    this.loadingSequences = true;
    this.getSequences();
    this.streetviewService.mapillaryUserSequences.subscribe(seq => {
      this.loadingSequences = true;
      if (seq) {
        this.userSequences = seq;
        this.loadingSequences = false;
        this.loadingMoreSequences = false;
      }
    });

    this.streetviewService.nextPage.subscribe(seq => {
      this.nextPageLink = seq;
    });

    this.streetviewService.googleUserSequences.subscribe(seq => {
      if (seq) {
        this.userSequences = seq;
      }
    });
  }

  getSequences() {
    this.loadingSequences = true;
    this.streetviewService.getMapillaryUserSequences();
  }

  addSequenceToList(sequence: string) {
    if (this.containsSequence(sequence)) {
      this.selectedSequences = this.selectedSequences.filter(e => e !== sequence);
    } else {
      this.selectedSequences.push(sequence);
    }
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  onChooseService(service: string) {
    this.streetviewService.clearMapillarySequences();
    this.loadingSequences = true;
    if (service == 'google') {
      this.streetviewService.getGoogleUserSequences();
    } else {
      this.streetviewService.getMapillaryUserSequences();
    }
  }

  cancel() {
    this.bsModalRef.hide();
  }

  publish() {
    this.onClose.next({
      selectedPath: this.selectedFiles[0],
      sequences: this.selectedSequences,
      service: this.currentService
    });
    this.bsModalRef.hide();
  }

  isLoggedIn(svService: string) {
    return this.streetviewAuthenticationService.isLoggedIn(svService);
  }

  loadMoreSequences() {
    this.loadingMoreSequences = true;
    this.streetviewService.getMapillaryUserSequences(this.nextPageLink);
  }

  containsSequence(sequenceKey: string) {
    return this.selectedSequences.includes(sequenceKey);
  }
}
