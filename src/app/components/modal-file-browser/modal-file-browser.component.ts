import { Component, OnInit } from '@angular/core';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import {ApiService} from 'ng-tapis';
import { TapisFilesService } from '../../services/tapis-files.service';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import {Subject} from 'rxjs';
import {Project} from '../../models/models';

@Component({
  selector: 'app-modal-file-browser',
  templateUrl: './modal-file-browser.component.html',
  styleUrls: ['./modal-file-browser.component.styl'],
})
export class ModalFileBrowserComponent implements OnInit {

  private currentUser: AuthenticatedUser;
  public filesList: Array<RemoteFile>;
  selectedFile: RemoteFile;
  inProgress: boolean;
  public selectedFiles: Map<string, RemoteFile> = new Map();
  public onClose: Subject<Array<RemoteFile>> = new Subject<Array<RemoteFile>>();
  private activeProject: Project;

  constructor(private tapisFilesService: TapisFilesService,
              private modalRef: BsModalRef,
              private authService: AuthService,
              private agaveSystemsService: AgaveSystemsService) { }

  ngOnInit() {
    // TODO: Get the systems in there
    this.agaveSystemsService.list();
    this.agaveSystemsService.projects.subscribe(systems => {
      console.log(systems);
    });
    this.authService.currentUser.subscribe(next => {
      this.currentUser = next;
      const init = <RemoteFile> {
        system: 'designsafe.storage.default',
        type: 'dir',
        path: this.currentUser.username
      };
      this.browse(init);
    });

  }

  browse(file: RemoteFile) {
    if (file.type !== 'dir') { return; }
    this.inProgress = true;
    this.selectedFiles.clear();
    this.tapisFilesService.listFiles(file.system, file.path);
    this.tapisFilesService.listing.subscribe(listing => {
      this.inProgress = false;
      this.filesList = listing;
    });
  }

  select(file: RemoteFile) {
    if (this.tapisFilesService.checkIfSelectable(file)) {
      this.addSelectedFile(file);
    }
  }

  addSelectedFile(file: RemoteFile) {
    if (this.selectedFiles.has(file.path)) {
      this.selectedFiles.delete(file.path);
    } else {
      this.selectedFiles.set(file.path, file);
    }
  }

  chooseFiles() {
    const tmp = Array.from(this.selectedFiles.values());
    this.onClose.next(tmp);
    this.modalRef.hide();
  }

  cancel() {
    this.modalRef.hide();
  }
}
