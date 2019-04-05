import { Component, OnInit } from '@angular/core';
import { ProjectsService } from "../../services/projects.service";
import { Project } from "../../models/models";
import { GeoDataService } from "../../services/geo-data.service";

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {

  private projects : Array<Project>;
  selectedProject : Project;

  constructor(private ProjectsService : ProjectsService, private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.ProjectsService.getProjects().subscribe( (projects)=> {
      this.projects = projects;
    })
  }

  selectProject(p: Project) {
    this.selectedProject = p;
    this.GeoDataService.getAllFeatures(p.id);
  }

}
