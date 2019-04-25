import { Component, OnInit } from '@angular/core';
import { ProjectsService } from "../../services/projects.service";
import { Project } from "../../models/models";
import { GeoDataService } from "../../services/geo-data.service";
import {LatLng} from "leaflet";
import {skip} from "rxjs/operators";

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {

  private projects : Array<Project>;
  selectedProject : Project;
  mapMouseLocation: LatLng = new LatLng(0,0);

  constructor(private ProjectsService : ProjectsService, private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.ProjectsService.getProjects().subscribe( (projects)=> {
      this.projects = projects;
      // TODO: remove that
      this.selectProject(projects[0])
    })

    this.GeoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next)=>{
      this.mapMouseLocation = next;
    })
  }

  selectProject(p: Project) : void {
    this.selectedProject = p;
    this.GeoDataService.getAllFeatures(p.id);
    this.GeoDataService.getOverlays(p.id);
  }

}
