import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import {RemoteFile} from 'ng-tapis';
import {RapidProjectRequest} from '../../models/rapid-project-request';
import {ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl']
})
export class ModalCreateProjectComponent implements OnInit {

  projCreateForm: FormGroup;
  rapidFolder: RemoteFile;
  submitting: boolean;
  errorMessage = '';
  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;

  constructor(private bsModalRef: BsModalRef,
              private cdref: ChangeDetectorRef,
              private projectsService: ProjectsService) { }

  ngOnInit() {
    this.submitting = false;
    this.projCreateForm = new FormGroup( {
      name: new FormControl(''),
      description: new FormControl(''),
      exportMap: new FormControl(false),
      linkProject: new FormControl(false)
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  close(project: Project) {
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
    if (system.id.includes('project')) {
      this.projCreateForm.get('linkProject').enable()
    } else {
      this.projCreateForm.get('linkProject').disable()
    }
  }

  createRapidProject() {
    this.errorMessage = '';
    const req: RapidProjectRequest = new RapidProjectRequest(this.rapidFolder.system, this.rapidFolder.path)
    this.projectsService.createRapidProject(req).subscribe( (project) => {
      this.close(project);
    }, (err) => {
     this.errorMessage = err.toString();
    });
  }

  submit() {
    this.submitting = true;
    const p = new Project();
    p.description = this.projCreateForm.get('description').value;
    p.name = this.projCreateForm.get('name').value;
    this.projectsService.create(p).subscribe( (project) => {
      if (this.projCreateForm.get('exportMap').value) {
        const path = this.selectedFiles.length > 0 ? this.selectedFiles[0].path : '/';
        const systemId = this.selectedSystem.id;
        if (this.projCreateForm.get('linkProject').value) {
          this.projectsService.linkExportProject(project, systemId, path);
        } else {
          this.projectsService.exportProject(project.id, systemId, path);
        }
      }
      this.close(project);
    }, err => {
      this.errorMessage = err.toString();
    });
    this.submitting = true;
  }
}
