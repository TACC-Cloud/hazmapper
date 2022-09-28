import { Component, Input, OnInit } from '@angular/core';
import { RemoteFile } from 'ng-tapis/models/remote-file';
import { Project, ProjectRequest } from '../../models/models';
import { ProjectsService } from '../../services/projects.service';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { TapisFilesService } from '../../services/tapis-files.service';
import { ChangeDetectorRef } from '@angular/core';
import { RapidProjectRequest } from '../../models/rapid-project-request';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-modal-link-project',
  templateUrl: './modal-link-project.component.html',
  styleUrls: ['./modal-link-project.component.styl'],
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
  watchContent = false;
  activeProject: Project;
  currentPath: string;
  projectObserveOptions = [
    { name: 'Sync Members and Files', value: true },
    { name: 'Sync Only Members', value: false },
  ];
  myDataObserveOptions = [
    { name: "Don't Sync", value: false },
    { name: 'Sync Files', value: true },
  ];
  observeOptions = this.myDataObserveOptions;
  observeOption = false;

  constructor(private modalRef: BsModalRef, private projectsService: ProjectsService, private cdref: ChangeDetectorRef) {}

  ngOnInit() {
    this.projectsService.activeProject.subscribe((next) => {
      this.activeProject = next;
      this.fileName = next.uuid;
    });
  }

  // tslint:disable-next-line
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  onSystemSelect(system: any) {
    this.selectedSystem = system;
    this.observeOption = false;
    if (system.id.startsWith('project')) {
      this.observeOptions = this.projectObserveOptions;
    } else {
      this.observeOptions = this.myDataObserveOptions;
    }
  }

  setCurrentPath(path: string) {
    this.currentPath = path;
  }

  submit() {
    const path = this.selectedFiles.length > 0 ? this.selectedFiles[0].path : this.currentPath;

    this.activeProject.system_path = path;
    this.activeProject.system_id = this.selectedSystem.id;
    this.activeProject.system_file = this.fileName;

    const pr = new ProjectRequest();

    pr.project = this.activeProject;

    if (this.selectedSystem.id.includes('project')) {
      pr.observable = true;
      pr.watch_content = this.observeOption;
    } else {
      pr.observable = this.observeOption;
      pr.watch_content = pr.observable ? true : false;
    }

    // this.projectsService.updateProject(this.activeProject, pr);
    this.projectsService.updateProject(pr);
    this.close();
  }

  close() {
    this.modalRef.hide();
  }
}
