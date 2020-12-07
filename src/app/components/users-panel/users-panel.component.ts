import { Component, OnInit } from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {ModalService} from '../../services/modal.service';
import {IProjectUser} from '../../models/project-user';
import {FormGroup, FormControl} from '@angular/forms';
import {Project} from '../../models/models';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  styleUrls: ['./users-panel.component.styl']
})
export class UsersPanelComponent implements OnInit {
  public projectUsers: Array<IProjectUser>;
  addUserForm: FormGroup;
  activeProject: Project;
  nameInputError: boolean = false;
  descriptionInputError: boolean = false;
  nameErrorMessage: string = "Project name must be under 512 characters!";
  descriptionErrorMessage: string = "Project description must be under 4096 characters!";

  constructor(private projectsService: ProjectsService, private modalService: ModalService) { }

  ngOnInit() {
    this.addUserForm = new FormGroup( {
      username: new FormControl()
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.projectsService.projectUsers$.subscribe( (next) => {
      this.projectUsers = next;
    });
  }

  getPublicUrl() {
   const publicUrl = location.origin + environment.baseHref + `maps-public/${this.activeProject.id}/`;
   return publicUrl;
  }

  makeMapPublic() {
    this.modalService.confirm(
      'Make map public',
      'Are you sure you want to make this map public?',
      ['Cancel', 'Make public']).subscribe( (answer) => {
      if (answer === 'Make public') {
        this.projectsService.updateProject(this.activeProject, undefined, undefined, true);
      }
    });
  }

  makeMapPrivate() {
    this.modalService.confirm(
      'Make map private',
      'Are you sure you want to make this map private? This map will no longer be viewable by the public.',
      ['Cancel', 'Make private']).subscribe( (answer) => {
      if (answer === 'Make private') {
        this.projectsService.updateProject(this.activeProject, undefined, undefined, false);
      }
    });
  }

  deleteProject() {
    this.modalService.confirm(
      'Delete map',
      'Are you sure you want to delete this map?  All associated features and metadata will be deleted. THIS CANNOT BE UNDONE.',
      ['Cancel', 'Delete']).subscribe( (answer) => {
      if (answer === 'Delete') {
        this.projectsService.deleteProject(this.activeProject);
      }
    });
  }

  addUser() {
    this.projectsService.addUserToProject(this.activeProject, this.addUserForm.get('username').value);
  }

  changeProjectName(name: string) {
    if (name.length < 512) {
      this.nameInputError = false;
      this.activeProject.name = name;
      this.projectsService.updateProject(this.activeProject, name, undefined, undefined);
    } else {
      this.nameInputError = true;
    }
  }

  changeProjectDescription(description: string) {
    if (description.length < 4096) {
      this.descriptionInputError = false;
      this.activeProject.description = description;
      this.projectsService.updateProject(this.activeProject, undefined, description, undefined);
    } else {
      this.descriptionInputError = true;
    }
  }
}
