import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { NotificationsService } from '../../services/notifications.service';
import { ModalService } from '../../services/modal.service';
import { TabsetComponent, BsModalService } from 'ngx-foundation';
import { IProjectUser } from '../../models/project-user';
import { Project, ProjectUpdateRequest } from '../../models/models';
import { EnvService } from '../../services/env.service';
import { AgaveSystemsService } from 'src/app/services/agave-systems.service';
import { combineLatest } from 'rxjs';
import { copyToClipboard } from '../../utils/copyText';

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  styleUrls: ['./users-panel.component.styl'],
})
export class UsersPanelComponent implements OnInit {
  @ViewChildren('staticTabs') staticTabs: QueryList<TabsetComponent>;

  public projectUsers: Array<IProjectUser>;
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

  constructor(
    private projectsService: ProjectsService,
    private bsModalService: BsModalService,
    private modalService: ModalService,
    private notificationsService: NotificationsService,
    private agaveSystemsService: AgaveSystemsService,
    private envService: EnvService
  ) {}

  ngOnInit() {
    this.agaveSystemsService.list();
    combineLatest([this.projectsService.activeProject, this.agaveSystemsService.projects]).subscribe(([activeProject, dsProjects]) => {
      if (activeProject) {
        const portalUrl = this.envService.designSafePortalUrl + '/data/browser/';
        this.activeProject = this.agaveSystemsService.getProjectMetadata([activeProject], dsProjects)[0];
        if (activeProject.system_id) {
          if (activeProject.system_id.startsWith('project')) {
            this.dsHref = portalUrl + 'projects/' + activeProject.ds_id + '/' + activeProject.system_path + '/';
            if (activeProject.ds_id) {
              this.projectHref = portalUrl + 'projects/' + activeProject.ds_id + '/';
            }
          } else {
            this.myDataHref = portalUrl + 'tapis/' + activeProject.system_id + '/';
            this.dsHref = this.myDataHref + activeProject.system_path + '/';
          }
        }
      }
    });

    this.projectsService.projectUsers$.subscribe((next) => {
      this.projectUsers = next;
    });
  }

  getPublicUrl() {
    const publicUrl = location.origin + this.envService.baseHref + `project-public/${this.activeProject.uuid}/`;
    return publicUrl;
  }

  copyLinkToClipboard(link: string) {
    copyToClipboard(link);
    this.notificationsService.showSuccessToast(`Copied ${link} to the clipboard!`);
  }

  updateMapPublicAccess(makePublic: boolean) {
    const title = makePublic ? 'Make map public' : 'Make map private';
    const message = makePublic
      ? 'Are you sure you want to make this map public?'
      : 'Are you sure you want to make this map private? This map will no longer be viewable by the public.';
    const action = makePublic ? 'Make public' : 'Make private';
    this.modalService.confirm(title, message, ['Cancel', action]).subscribe((answer) => {
      if (answer === action) {
        this.publicStatusChanging = true;
        this.publicStatusChangingError = false;
        this.projectsService.updateActiveProject(undefined, undefined, makePublic).subscribe(
          (resp) => {
            this.publicStatusChanging = false;
          },
          (err) => {
            this.publicStatusChanging = false;
            this.publicStatusChangingError = true;
          }
        );
      }
    });
  }

  openTaggit() {
    window.localStorage.setItem(this.projectsService.getLastProjectKeyword(), JSON.stringify(this.activeProject));
    window.location.href = this.envService.taggitUrl;
  }

  deleteProject() {
    this.modalService
      .confirm(
        'Delete map',
        'Are you sure you want to delete this map?  All associated features and metadata will be deleted. THIS CANNOT BE UNDONE.',
        ['Cancel', 'Delete']
      )
      .subscribe((answer) => {
        if (answer === 'Delete') {
          this.projectsService.deleteProject(this.activeProject);
        }
      });
  }

  selectTab(tabId: number) {
    this.staticTabs.first.tabs[tabId].active = true;
  }

  changeProjectName(name: string) {
    if (name.length < 512) {
      this.nameInputError = false;
      this.activeProject.name = name;

      const pr = new ProjectUpdateRequest();
      pr.name = this.activeProject.name;

      this.projectsService.updateProject(this.activeProject, pr);
    } else {
      this.nameInputError = true;
    }
  }

  changeProjectDescription(description: string) {
    if (description.length < 4096) {
      this.descriptionInputError = false;
      this.activeProject.description = description;

      const pr = new ProjectUpdateRequest();
      pr.description = this.activeProject.description;

      this.projectsService.updateProject(this.activeProject, pr);
    } else {
      this.descriptionInputError = true;
    }
  }
}
