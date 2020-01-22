import { Component, OnInit } from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {Project} from '../../models/models';


interface IpanelsDisplay {
  assets: boolean;
  layers: boolean;
  filters: boolean;
  measure: boolean;
  settings: boolean;
  pointClouds: boolean;
}

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.styl']
})
export class DockComponent implements OnInit {

  panelsDisplay: IpanelsDisplay;
  activeProject: Project;

  constructor(private projectsService: ProjectsService) { }

  ngOnInit() {
    this.panelsDisplay = <IpanelsDisplay> {
      assets: false,
      layers: false,
      filters: false,
      pointClouds: false,
      measure: false,
      settings: false
    };

    this.projectsService.activeProject.subscribe( (next)=> {
      this.activeProject = next;
    });

  }

  showPanel(pname: string) {
    for (const key in this.panelsDisplay) {
      if (key !== pname) { this.panelsDisplay[key] = false; }
    }
    this.panelsDisplay[pname] = !this.panelsDisplay[pname];

  }

}

