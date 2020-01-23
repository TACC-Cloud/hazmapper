import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthenticatedUser, AuthService} from '../../services/authentication.service';
import {RemoteFile} from 'ng-tapis/models/remote-file';
import {combineLatest} from 'rxjs';
import {SystemSummary} from 'ng-tapis';
import {TapisFilesService} from '../../services/tapis-files.service';
import {BsModalRef} from 'ngx-foundation/modal/bs-modal-ref.service';
import {AgaveSystemsService} from '../../services/agave-systems.service';

@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.styl']
})
export class FileBrowserComponent implements OnInit {

  @Input() single = false;
  @Input() allowFolders = false;
  @Input() onlyFolder = false;
  @Input() heading = 'Select Files';
  @Input() helpText = 'Note: Only files are selectable, not folders. Double click on a folder to navigate into it.';
  @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_TYPES;
  @Output() selection: EventEmitter<Array<RemoteFile>> = new EventEmitter<Array<RemoteFile>>();

  private currentUser: AuthenticatedUser;
  public filesList: Array<RemoteFile>;
  public inProgress: boolean;
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
    // wait on the currentUser and systems to resolve
    combineLatest([this.authService.currentUser, this.agaveSystemsService.systems, this.agaveSystemsService.projects])
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
    this.inProgress = true;
    this.selectedFiles.clear();
    this.tapisFilesService.listFiles(file.system, file.path);
    this.tapisFilesService.listing.subscribe(listing => {
      this.inProgress = false;
      this.filesList = listing;
    });
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
