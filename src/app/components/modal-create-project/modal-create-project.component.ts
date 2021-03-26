import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import {RemoteFile} from 'ng-tapis';
import {RapidProjectRequest} from '../../models/rapid-project-request';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl']
})
export class ModalCreateProjectComponent implements OnInit {

  public readonly onClose: Subject<any> = new Subject<any>();

  projCreateForm: FormGroup;
  rapidFolder: RemoteFile;
  submitting: boolean;
  errorMessage = '';

  constructor(private bsModalRef: BsModalRef, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.submitting = false;
    this.projCreateForm = new FormGroup( {
      name: new FormControl(''),
      description: new FormControl('')
    });

  }

  close(project: Project) {
    this.onClose.next(project);
    this.bsModalRef.hide();
  }

  onFolderSelection(item: Array<RemoteFile>) {
    this.rapidFolder = item[0];
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
      this.close(project);
    }, err => {
      this.errorMessage = err.toString();
    });
    this.submitting = true;
  }

}
