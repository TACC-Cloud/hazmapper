import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project, ProjectRequest } from '../../models/models';
import {RemoteFile} from 'ng-tapis';
import {ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl']
})
export class ModalCreateProjectComponent implements OnInit, AfterContentChecked {

  public readonly onClose: Subject<any> = new Subject<any>();

  projCreateForm: FormGroup;
  rapidFolder: RemoteFile;
  submitting: boolean;
  errorMessage = '';
  currentPath: string;
  fileName = '';
  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;
  projectObserveOptions = [{name: 'Sync Members and Files', value: true}, {name: 'Sync Only Members', value: false}];
  myDataObserveOptions = [{name: 'Don\'t Sync', value: false}, {name: 'Sync Files', value: true}];
  observeOptions = this.myDataObserveOptions;

  constructor(private bsModalRef: BsModalRef,
              private cdref: ChangeDetectorRef,
              private projectsService: ProjectsService) { }

  ngOnInit() {
    this.submitting = false;
    this.projCreateForm = new FormGroup( {
      name: new FormControl(''),
      description: new FormControl(''),
      link: new FormControl(false),
      observeOption: new FormControl(false),
      fileName: new FormControl('')
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  close(project: Project) {
    this.onClose.next(project);
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
    this.projCreateForm.get('observeOption').setValue(false);
    if (system.id.includes('project')) {
      this.observeOptions = this.projectObserveOptions;
    } else {
      this.observeOptions = this.myDataObserveOptions;
    }
  }

  submit() {
    this.submitting = true;
    const p = new Project();
    const pr = new ProjectRequest();

    p.description = this.projCreateForm.get('description').value;
    p.name = this.projCreateForm.get('name').value;

    if (this.projCreateForm.get('link').value) {
      p.system_path = this.selectedFiles.length > 0 ? this.selectedFiles[0].path : this.currentPath;
      p.system_id = this.selectedSystem.id;
      p.system_file = this.projCreateForm.get('fileName').value;

      if (this.selectedSystem.id.includes('project')) {
        pr.observable = true;
        pr.watch_content = this.projCreateForm.get('observeOption').value;
      } else {
        pr.observable = this.projCreateForm.get('observeOption').value;
        pr.watch_content = pr.observable ? true : false;
      }
    } else {
      pr.observable = false;
      pr.watch_content = false;
    }

    pr.link = this.projCreateForm.get('link').value;

    pr.project = p;

    this.projectsService.create(pr).subscribe((project) => {
      this.close(project);
    }, err => {
      this.errorMessage = err.toString();
    });
    this.submitting = true;
  }

  setCurrentPath(path: string) {
    this.currentPath = path;
  }
}
