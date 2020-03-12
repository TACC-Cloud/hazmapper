import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-foundation';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import {RemoteFile} from 'ng-tapis';
import {RapidProjectRequest} from '../../models/rapid-project-request';

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl']
})
export class ModalCreateProjectComponent implements OnInit {

  projCreateForm: FormGroup;
  rapidFolder: RemoteFile;
  errorMessage = '';

  constructor(private bsModalRef: BsModalRef, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.projCreateForm = new FormGroup( {
      name: new FormControl(''),
      description: new FormControl('')
    });

  }

  close() {
    this.bsModalRef.hide();
  }

  onFolderSelection(item: Array<RemoteFile>) {
    this.rapidFolder = item[0];
  }

  createRapidProject() {
    this.errorMessage = '';
    const req: RapidProjectRequest = new RapidProjectRequest(this.rapidFolder.system, this.rapidFolder.path)
    this.projectsService.createRapidProject(req).subscribe( (resp) => {
      this.bsModalRef.hide();
    }, (err) => {
     this.errorMessage = err.toString();
    });
  }

  submit() {
    const p = new Project();
    p.description = this.projCreateForm.get('description').value;
    p.name = this.projCreateForm.get('name').value;
    this.projectsService.create(p).subscribe( (next) => {
      this.close();
    }, err => {
      this.errorMessage = err.toString();
    });

  }

}
