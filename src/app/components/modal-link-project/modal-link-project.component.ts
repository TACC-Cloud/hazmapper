import { Component, Input, OnInit } from '@angular/core';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { Project } from '../../models/models';
import { ProjectsService } from '../../services/projects.service';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { TapisFilesService } from '../../services/tapis-files.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-modal-link-project',
  templateUrl: './modal-link-project.component.html',
  styleUrls: ['./modal-link-project.component.styl']
})
export class ModalLinkProjectComponent implements OnInit {
  @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_FEATURE_TYPES;
  @Input() single: false;
  @Input() allowFolders: false;
  @Input() onlyFolder: false;
  @Input() allowEmptyFiles: false;
  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;
  fileName = '';
  activeProject: Project;
  linkProject = false;
  currentPath: string;
  confirmRemove = false;
  public onClose: Subject<any> = new Subject<any>();
  constructor(private modalRef: BsModalRef,
              private projectsService: ProjectsService,
              private tapisFilesService: TapisFilesService,
              private cdref: ChangeDetectorRef ) { }

  ngOnInit() {
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
      this.fileName = next.uuid;
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  onSystemSelect(system: any) {
    this.selectedSystem = system;
    if (system.id.includes('project')) {
      this.linkProject = true;
    } else {
      this.linkProject = false;
    }
  }

  setCurrentPath(path: string) {
    this.currentPath = path;
  }

  close() {
    this.onClose.next({
      fileList: this.selectedFiles,
      linkProject: this.linkProject,
      system: this.selectedSystem,
      fileName: this.fileName,
      currentPath: this.currentPath
    });
    this.modalRef.hide();
  }

  cancel() {
    this.modalRef.hide();
  }
}
