import { Component, OnInit } from '@angular/core';
import {Project} from '../../models/models';
import {ProjectsService} from '../../services/projects.service';


@Component({
  selector: 'app-public-map-info-panel',
  templateUrl: './public-map-info-panel.component.html',
  styleUrls: ['./public-map-info-panel.component.styl']
})
export class PublicMapInfoPanelComponent implements OnInit {
  activeProject: Project;

  constructor(private projectsService: ProjectsService) { }

  ngOnInit() {

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

  }
}
