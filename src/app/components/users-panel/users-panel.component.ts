import { Component, OnInit } from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {ModalService} from '../../services/modal.service';
import {IProjectUser} from '../../models/project-user';
import {FormGroup, FormControl} from '@angular/forms';
import {Project} from '../../models/models';
import {EnvService} from '../../services/env.service';

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  styleUrls: ['./users-panel.component.styl']
})
export class UsersPanelComponent implements OnInit {
  public projectUsers: Array<IProjectUser>;
  addUserForm: FormGroup;
  activeProject: Project;
  nameInputError = false;
  descriptionInputError = false;
  nameErrorMessage = 'Project name must be under 512 characters!';
  descriptionErrorMessage = 'Project description must be under 4096 characters!';
  publicStatusChanging = false;
  publicStatusChangingError = false;

  constructor(private projectsService: ProjectsService,
              private modalService: ModalService,
              private envService: EnvService) { }

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
   const publicUrl = location.origin + this.envService.baseHref + `project-public/${this.activeProject.uuid}/`;
   return publicUrl;
  }

  updateMapPublicAccess(makePublic: boolean) {
    const title = makePublic ? 'Make map public' : 'Make map private';
    const message = makePublic ? 'Are you sure you want to make this map public?'
      : 'Are you sure you want to make this map private? This map will no longer be viewable by the public.';
    const action = makePublic ? 'Make public' : 'Make private';
    this.modalService.confirm(
      title,
      message,
      ['Cancel', action]).subscribe( (answer) => {
      if (answer === action) {
        this.publicStatusChanging = true;
        this.publicStatusChangingError = false;
        this.projectsService.updateActiveProject(undefined, undefined, makePublic).subscribe( (resp) => {
          this.publicStatusChanging = false;
        }, (err) => {
          this.publicStatusChanging = false;
          this.publicStatusChangingError = true;
        });
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
