import { Component, OnInit } from '@angular/core';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import {ApiService} from 'ng-tapis';
import { TapisFilesService } from '../../services/tapis-files.service';

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

  constructor(private tapisFilesService: TapisFilesService,
              private authService: AuthService,
              private agaveSystemsService: AgaveSystemsService) { }

  ngOnInit() {
    // TODO: Get the systems in there
    this.agaveSystemsService.list();
    // this.AgaveSystemsService.projects.subscribe(systems=>{
    //   console.log(systems);
    // });
    this.authService.currentUser.subscribe(next => {
      this.currentUser = next;
      this.browse('designsafe.storage.default', this.currentUser.username);
    });

  }

  browse(system: string, path: string) {
    this.inProgress = true;
    this.selectedFile = null;
    this.tapisFilesService.listFiles(system, path);
    this.tapisFilesService.listing.subscribe(listing => {
      this.inProgress = false;
      this.filesList = listing;
    });
  }

  select(file: RemoteFile) {
    this.selectedFile = file;
  }
}
