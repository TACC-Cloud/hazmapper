import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {RemoteFile} from 'ng-tapis/models/remote-file';
import {combineLatest} from 'rxjs';
import {SystemSummary} from 'ng-tapis';
import {TapisFilesService} from '../../services/tapis-files.service';
import {BsModalRef} from 'ngx-foundation/modal/bs-modal-ref.service';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.styl']
})
export class FileBrowserComponent implements OnInit {

  static limit = 200;

  @Input() single = false;
  @Input() allowFolders = false;
  @Input() onlyFolder = false;
  @Input() heading = 'Select Files';
  @Input() helpText = 'Note: Only files are selectable, not folders. Double click on a folder to navigate into it.';
  @Input() allowedExtensions: Array<string> = [];
  @Output() selection: EventEmitter<Array<RemoteFile>> = new EventEmitter<Array<RemoteFile>>();

  private currentUser: AuthenticatedUser;
  private currentDirectory: RemoteFile;
  public filesList: Array<RemoteFile> = [];
  public inProgress = true;
  public hasError: boolean;
  private offset = 0;
  public selectedFiles: Map<string, RemoteFile> = new Map();
  public projects: Array<SystemSummary>;
  private selectedSystem: SystemSummary;
  public myDataSystem: SystemSummary;
  public communityDataSystem: SystemSummary;
  public publishedDataSystem: SystemSummary;

  constructor(private tapisFilesService: TapisFilesService,
              private modalRef: BsModalRef,
              private authService: AuthService,
              private agaveSystemsService: AgaveSystemsService) { }

  ngOnInit() {
    this.agaveSystemsService.list();

    // TODO: change those hard coded systemIds to environment vars or some sort of config
    // wait on the currentUser, systems and projects to resolve
    combineLatest(
        this.authService.currentUser,
        this.agaveSystemsService.systems,
        this.agaveSystemsService.projects
    )
      .pipe(
        take(1)
      )
      .subscribe( ([user, systems, projects]) => {
        this.myDataSystem = systems.find( (sys) => sys.id === 'designsafe.storage.default');
        this.communityDataSystem = systems.find( (sys) => sys.id === 'designsafe.storage.community');
        this.publishedDataSystem = systems.find( (sys) => sys.id === 'designsafe.storage.published');
        this.selectedSystem = this.myDataSystem;
        this.projects = projects;
        this.currentUser = user;
        const init = <RemoteFile> {
          system: this.myDataSystem.id,
          type: 'dir',
          path: this.currentUser.username
        };
        this.browse(init);
      });

  }

  selectSystem(system: SystemSummary): void {
    let pth;
    system.id === this.myDataSystem.id ? pth = this.currentUser.username : pth = '/';
    const init = <RemoteFile> {
      system: system.id,
      type: 'dir',
      path: pth
    };
    this.browse(init);
  }


  browse(file: RemoteFile) {
    if (file.type !== 'dir') { return; }
    this.currentDirectory = file;
    this.selectedFiles.clear();
    this.selection.next(Array<RemoteFile>());
    this.filesList = [];
    this.offset = 0;
    this.inProgress = false;
    this.hasError = false;
    this.getFiles();
  }

  getFiles() {
    const hasMoreFiles = (this.offset % FileBrowserComponent.limit) === 0;

    if (this.inProgress || !hasMoreFiles) {
      return;
    }

    this.inProgress = true;
    this.tapisFilesService.listFiles(this.currentDirectory.system, this.currentDirectory.path, this.offset, FileBrowserComponent.limit)
      .subscribe(
        response => {
                const files = response.result;

                if (files.length && files[0].name === '.') {
                  // This removes the first item in the listing, which in Agave
                  // is always a reference to self '.' and replaces with '..'
                  const current = files.shift();
                  current.path = this.tapisFilesService.getParentPath(current.path);
                  current.name = '..';
                  files.unshift(current);
                }

                this.inProgress = false;
                this.filesList = this.filesList.concat(files);
                this.offset = this.offset + files.length;
              },
          error => {
            this.inProgress = false;
            this.hasError = true;
          }
      );
  }

  select(file: RemoteFile) {
    // make sure the extension is selectable
    if (this.checkIfSelectable(file)) {
      this.addSelectedFile(file);
    }
  }

  checkIfSelectable(file: RemoteFile): boolean {
    // If its a folder, make sure that is allowed;
    if (file.type === 'dir') {
      return (this.allowFolders || this.onlyFolder);
    } else {
      const ext = this.tapisFilesService.getFileExtension(file);
      return this.allowedExtensions.includes(ext);
    }
  }

  addSelectedFile(file: RemoteFile) {

    if (this.selectedFiles.has(file.path)) {
      this.selectedFiles.delete(file.path);
    } else {
      if (this.single) {
        this.selectedFiles.clear();
      }
      this.selectedFiles.set(file.path, file);
    }
    const tmp = Array.from(this.selectedFiles.values());
    this.selection.next(tmp);
  }

}
