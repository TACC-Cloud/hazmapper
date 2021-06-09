import {Component, Input, OnInit} from '@angular/core';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { TapisFilesService } from '../../services/tapis-files.service';

@Component({
  selector: 'app-modal-file-browser',
  templateUrl: './modal-file-browser.component.html',
  styleUrls: ['./modal-file-browser.component.styl'],
})
export class ModalFileBrowserComponent implements OnInit {
  @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_FEATURE_TYPES;
  @Input() single: false;
  @Input() allowFolders: false;
  @Input() onlyFolder: false;
  selectedFiles: Array<RemoteFile> = [];
  public onClose: Subject<Array<RemoteFile>> = new Subject<Array<RemoteFile>>();
  constructor(private modalRef: BsModalRef, private tapisFilesService: TapisFilesService) { }

  ngOnInit() {
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  close() {
    this.onClose.next(this.selectedFiles);
    this.modalRef.hide();
  }

  cancel() {
    this.modalRef.hide();
  }
}
