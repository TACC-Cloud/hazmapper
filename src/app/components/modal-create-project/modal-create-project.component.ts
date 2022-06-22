import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project, ProjectRequest } from '../../models/models';
import { RemoteFile } from 'ng-tapis';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl'],
})
export class ModalCreateProjectComponent
  implements OnInit, AfterContentChecked
{
  public readonly onClose: Subject<any> = new Subject<any>();

  projCreateForm: FormGroup;
  rapidFolder: RemoteFile;
  submitting: boolean;
  errorMessage = '';
  currentPath: string;
  fileName = '';
  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;
  filesList = [];

  constructor(
    private bsModalRef: BsModalRef,
    private cdref: ChangeDetectorRef,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    this.submitting = false;
    this.projCreateForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      watchContent: new FormControl(false),
      fileName: new FormControl(''),
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  close(project?: Project) {
    if (project) {
      this.onClose.next(project);
    }
    this.bsModalRef.hide();
  }

  onFolderSelection(item: Array<RemoteFile>) {
    this.rapidFolder = item[0];
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  onSystemSelect(system: any) {
    this.selectedSystem = system;
    this.projCreateForm.get('watchContent').setValue(false);
  }

  setFileName(ev: any) {
    this.projCreateForm.get('fileName').setValue(ev.target.value);
  }

  submit() {
    this.submitting = true;
    const p = new Project();
    const pr = new ProjectRequest();

    p.description = this.projCreateForm.get('description').value;
    p.name = this.projCreateForm.get('name').value;
    p.system_path =
      this.selectedFiles.length > 0
        ? this.selectedFiles[0].path || '/'
        : this.currentPath || '/';

    p.system_id = this.selectedSystem.id;
    p.system_file = this.projCreateForm.get('fileName').value
      ? this.projCreateForm.get('fileName').value
      : p.name;

    if (this.selectedSystem.id.includes('project')) {
      pr.observable = true;
      pr.watch_content = this.projCreateForm.get('watchContent').value;
    } else {
      pr.observable = this.projCreateForm.get('watchContent').value;
      pr.watch_content = pr.observable;
    }

    this.errorMessage = '';

    pr.project = p;

    this.projectsService.create(pr).subscribe(
      (project) => {
        this.close(project);
      },
      (err) => {
        this.errorMessage =
          err.error && err.error.message
            ? err.error.message
            : 'That folder is already syncing with a different map!';

        this.submitting = false;
      }
    );
  }

  updateFilesList(filesList: any) {
    this.filesList = filesList ? filesList : [];
  }

  setCurrentPath(path: string) {
    this.currentPath = path;
  }
}
