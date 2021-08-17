import { Component, Input, OnInit } from '@angular/core';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { Project } from '../../models/models';
import { ProjectsService } from '../../services/projects.service';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import {TapisFilesService} from '../../services/tapis-files.service';
import {ChangeDetectorRef} from '@angular/core';
import { RapidProjectRequest } from '../../models/rapid-project-request';
import {NotificationsService} from '../../services/notifications.service';


@Component({
  selector: 'app-modal-link-project',
  templateUrl: './modal-link-project.component.html',
  styleUrls: ['./modal-link-project.component.styl']
})
export class ModalLinkProjectComponent implements OnInit {
  @Input() allowedExtensions: Array<string> = [];
  @Input() single: true;
  @Input() allowFolders: true;
  @Input() onlyFolder: true;
  @Input() allowEmptyFiles: true;

  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;
  fileName = '';
  activeProject: Project;
  linkProject = false;
  currentPath: string;
  confirmRemove = false;
  constructor(private modalRef: BsModalRef,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
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

  submit() {
    const path = this.selectedFiles.length > 0 ? this.selectedFiles[0].path : this.currentPath;
    const linkProject = this.selectedSystem.id.includes('project');
    this.projectsService.exportProject(
      this.activeProject,
      this.selectedSystem.id,
      linkProject,
      false,
      path,
      this.fileName,
    );
    this.close();
  }

  close() {
    this.modalRef.hide();
  }
}
