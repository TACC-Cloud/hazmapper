import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from "ngx-foundation";
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectsService } from "../../services/projects.service";
import { Project } from "../../models/models";

@Component({
  selector: 'app-modal-create-project',
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.styl']
})
export class ModalCreateProjectComponent implements OnInit {

  projCreateForm: FormGroup;

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

  submit() {
    this.projectsService.create()
  }

}
