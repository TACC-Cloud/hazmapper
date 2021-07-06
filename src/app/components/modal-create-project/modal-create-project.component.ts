import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import {RemoteFile} from 'ng-tapis';
import {RapidProjectRequest} from '../../models/rapid-project-request';
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

  constructor(private bsModalRef: BsModalRef,
              private cdref: ChangeDetectorRef,
              private projectsService: ProjectsService) { }

  ngOnInit() {
    this.submitting = false;
    this.projCreateForm = new FormGroup( {
      name: new FormControl(''),
      description: new FormControl(''),
      exportMapLink: new FormControl(false),
      linkProject: new FormControl(false),
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
    if (system.id.includes('project')) {
      this.projCreateForm.get('linkProject').setValue(true);
    } else {
      this.projCreateForm.get('linkProject').setValue(false);
    }
  }

  createRapidProject() {
    this.errorMessage = '';
    const req: RapidProjectRequest = new RapidProjectRequest(this.rapidFolder.system, this.rapidFolder.path, true);
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
    this.projectsService.create(p).subscribe((project) => {
      if (this.projCreateForm.get('exportMapLink').value) {
        const path = this.selectedFiles.length > 0 ? this.selectedFiles[0].path : this.currentPath;
        const systemId = this.selectedSystem.id;
        if (!systemId.includes('project')) {
          this.projectsService.exportProject(project,
            systemId,
            path,
            this.projCreateForm.get('linkProject').value,
            this.projCreateForm.get('fileName').value);
        } else {
          const req: RapidProjectRequest = new RapidProjectRequest(
            systemId,
            path,
            true,
            project.id,
            this.projCreateForm.get('fileName').value
          );
          this.projectsService.createRapidProject(req).subscribe((resProject: Project) => {
            this.close(resProject);
          }, (err) => {
            this.errorMessage = err.toString();
          });
        }
      }
       
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
