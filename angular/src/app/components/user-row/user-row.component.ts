import {Component, Input, OnInit} from '@angular/core';
import {IProjectUser} from '../../models/project-user';
import {ProjectsService} from "../../services/projects.service";
import {Project} from "../../models/models";


@Component({
  selector: 'app-user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.styl']
})
export class UserRowComponent implements OnInit {

  @Input() user: IProjectUser;
  activeProject: Project;

  constructor(private projectsService: ProjectsService) {

  }


  ngOnInit() {
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
  }
}
