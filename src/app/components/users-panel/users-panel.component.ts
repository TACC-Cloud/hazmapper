import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {IProjectUser} from '../../models/project-user';
import {FormGroup, FormControl} from '@angular/forms';
import {Project} from '../../models/models';

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  styleUrls: ['./users-panel.component.styl']
})
export class UsersPanelComponent implements OnInit {

  public projectUsers: Array<IProjectUser>;
  addUserForm: FormGroup;
  activeProject: Project;

  constructor(private projectsService: ProjectsService) { }

  ngOnInit() {

    this.addUserForm = new FormGroup( {
      username: new FormControl()
    });
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
    this.projectsService.projectUsers$.subscribe( (next) => {
      console.log(next);
      this.projectUsers = next;
    });
  }

  deleteProject() {
    this.projectsService.deleteProject(this.activeProject);
  }

  addUser() {
    console.log(this.addUserForm);
    this.projectsService.addUserToProject(this.activeProject, this.addUserForm.get('username').value);
  }


}
