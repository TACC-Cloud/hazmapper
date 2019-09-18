import { Component, OnInit } from '@angular/core';
import {AgaveFilesService} from "../../services/agave-files.service";
import {AuthenticatedUser, AuthService} from "../../services/authentication.service";
import {FileInfo} from "../../models/agave-models";
// import * as path from "path";

@Component({
  selector: 'app-modal-file-browser',
  templateUrl: './modal-file-browser.component.html',
  styleUrls: ['./modal-file-browser.component.styl']
})
export class ModalFileBrowserComponent implements OnInit {

  private currentUser: AuthenticatedUser;
  public filesList: Array<FileInfo>;
  selectedFile: FileInfo;

  constructor(private AgaveFilesService: AgaveFilesService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(next=>{
      this.currentUser = next;
      this.browse('designsafe.storage.default', this.currentUser.username)
    });

  }

  browse(system: string, path: string) {
    this.AgaveFilesService.listFiles(system, path).subscribe(files=>{
      this.filesList = files;
    });
  }

  select(file:FileInfo) {
    this.selectedFile = file;
  }
}
