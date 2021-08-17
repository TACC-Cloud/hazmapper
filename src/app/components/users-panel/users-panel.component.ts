import { Component, OnInit } from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {NotificationsService} from '../../services/notifications.service';
import {ModalService} from '../../services/modal.service';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import {IProjectUser} from '../../models/project-user';
import {FormGroup, FormControl} from '@angular/forms';
import {Project} from '../../models/models';
import {EnvService} from '../../services/env.service';
import { ModalLinkProjectComponent } from '../modal-link-project/modal-link-project.component';
import { AgaveSystemsService } from 'src/app/services/agave-systems.service';
import { combineLatest } from 'rxjs';
import { copyToClipboard } from '../../utils/copyText';
import {RapidProjectRequest} from 'src/app/models/rapid-project-request';

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
  dsHref: string;
  projectHref: string;
  myDataHref: string;

  constructor(private projectsService: ProjectsService,
              private bsModalService: BsModalService,
              private modalService: ModalService,
              private notificationsService: NotificationsService,
              private agaveSystemsService: AgaveSystemsService,
              private envService: EnvService) { }

  ngOnInit() {
    this.agaveSystemsService.list();

    this.addUserForm = new FormGroup( {
      username: new FormControl()
    });

    combineLatest([this.projectsService.activeProject,
                                         this.agaveSystemsService.projects])
      .subscribe(([activeProject, dsProjects]) => {
      if (activeProject) {
        const portalUrl = this.envService.portalUrl + 'data/browser/';
        this.activeProject = this.agaveSystemsService.getDSProjectInformation([activeProject], dsProjects)[0];
        if (activeProject.system_id) {
          if (activeProject.system_id.includes('project')) {
            this.dsHref = portalUrl + 'projects/' +
              activeProject.system_id.substr(8) + '/' +
              activeProject.system_path + '/';
            if (activeProject.ds_id) {
              this.projectHref = portalUrl + 'projects/' +
                activeProject.system_id.substr(8) + '/';
            }
          } else {
            this.myDataHref = portalUrl + 'agave/' +
              activeProject.system_id;
            this.dsHref = this.myDataHref +
              activeProject.system_path + '/';
          }
        }
      }
    });

    this.projectsService.projectUsers$.subscribe( (next) => {
      this.projectUsers = next;
    });
  }

  getPublicUrl() {
   const publicUrl = location.origin + this.envService.baseHref + `project-public/${this.activeProject.uuid}/`;
   return publicUrl;
  }

  openExportProjectModal() {
    this.bsModalService.show(ModalLinkProjectComponent);
  }

  copyLinkToClipboard(link: string) {
    copyToClipboard(link);
    this.notificationsService.showSuccessToast(`Copied ${link} to the clipboard!`);
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
