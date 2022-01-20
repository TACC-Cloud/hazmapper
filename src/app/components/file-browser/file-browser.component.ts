import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {RemoteFile} from 'ng-tapis/models/remote-file';
import {combineLatest} from 'rxjs';
import {SystemSummary} from 'ng-tapis';
import {TapisFilesService} from '../../services/tapis-files.service';
import {BsModalRef} from 'ngx-foundation/modal/bs-modal-ref.service';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {max, take} from 'rxjs/operators';

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
  @Input() showPublicSystems = true;
  @Input() heading = 'Select Files';
  @Input() helpText = 'Note: Only files are selectable, not folders. Double click on a folder to navigate into it.';
  @Input() allowedExtensions: Array<string> = [];
  @Output() selection: EventEmitter<Array<RemoteFile>> = new EventEmitter<Array<RemoteFile>>();
  @Output() systemSelection: EventEmitter<any> = new EventEmitter<any>();
  @Output() getFilesList: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentPath: EventEmitter<string> = new EventEmitter<string>();

  private currentUser: AuthenticatedUser;
  private currentDirectory: RemoteFile;
  public filesList: Array<RemoteFile> = [];
  public inProgress = true;
  public hasError: boolean;
  private offset = 0;
  public selectedFiles: Map<string, RemoteFile> = new Map();

  public firstFileIndex: number;
  public fileDeselectMode = false;

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
        this.projects = projects;
        this.selectedSystem = this.myDataSystem;
        this.systemSelection.next(this.myDataSystem);
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
    this.systemSelection.next(system);
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
                  this.currentPath.next(current.path);
                  current.path = this.tapisFilesService.getParentPath(current.path);
                  current.name = '..';
                  files.unshift(current);
                }

                this.inProgress = false;
                this.filesList = this.filesList.concat(files);
                this.getFilesList.next(this.filesList.map(file => file.name));
                this.offset = this.offset + files.length;
              },
          error => {
            this.inProgress = false;
            this.hasError = true;
          }
      );
  }

  addRangeFiles(firstFileIndex: number, lastFileIndex: number, again: boolean) {
    const maxIndex = Math.max(firstFileIndex, lastFileIndex);
    const minIndex = Math.min(firstFileIndex, lastFileIndex);

    for (let i = minIndex; i < maxIndex + 1; ++i) {
      this.addSelectedFile(this.filesList[i], -1);
    }

    if (again) {
      this.addSelectedFile(this.filesList[firstFileIndex], -1);
    }
  }

  selectShift(index: number, file: RemoteFile) {
    if (this.firstFileIndex !== undefined && this.firstFileIndex !== index) {
      this.addRangeFiles(this.firstFileIndex, index, true);
    } else {
      this.addSelectedFile(file, index);
    }
  }

  selectFilesShiftCtrlClick(index: number, file: RemoteFile) {
    if (this.selectedFiles.has(this.filesList[index].path)) {
      // Deselecting file among selected files
      this.selectedFiles.delete(this.filesList[index].path);
      this.fileDeselectMode = true;
      this.firstFileIndex = undefined;
    } else {
      if (!this.fileDeselectMode) {
        this.selectShift(index, file);
      } else {
        // Selecting unselected after deselected is true to allow indexing
        this.fileDeselectMode = false;
        this.addSelectedFile(file, index);
      }
    }
  }

  selectFilesShiftClick(index: number, file: RemoteFile) {
    this.selectedFiles.clear();
    this.selectShift(index, file);
  }

  selectFilesCtrlClick(index: number, file: RemoteFile) {
    this.fileDeselectMode = false;
    if (this.selectedFiles.has(file.path)) {
      this.selectedFiles.delete(file.path);
    } else {
      this.addSelectedFile(file, index);
    }
  }

  selectFilesClick(index: number, file: RemoteFile) {
    this.fileDeselectMode = false;
    this.selectedFiles.clear();
    this.addSelectedFile(file, index);
  }

  select(event: any, index: number, file: RemoteFile) {
    event.stopPropagation();

    if (event.shiftKey && event.ctrlKey) {
      this.selectFilesShiftCtrlClick(index, file);
    } else if (event.shiftKey) {
      this.selectFilesShiftClick(index, file);
    } else if (event.ctrlKey) {
      this.selectFilesCtrlClick(index, file);
    } else {
      this.selectFilesClick(index, file);
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

  addSelectedFile(file: RemoteFile, index: number) {
    if (index !== -1) {
      this.firstFileIndex = index;
    }

    if (this.checkIfSelectable(file)) {
      if (this.single) {
        this.selectedFiles.clear();
      }
      this.selectedFiles.set(file.path, file);
      const tmp = Array.from(this.selectedFiles.values());
      this.selection.next(tmp);
    }
  }

}
