import { Component, OnInit } from '@angular/core';
import { ProjectsService } from "../../services/projects.service";
import { Project } from "../../models/models";
import { GeoDataService } from "../../services/geo-data.service";
import {LatLng} from "leaflet";
import {skip} from "rxjs/operators";
import {BsModalService} from "ngx-foundation";
import {ModalCreateProjectComponent} from "../modal-create-project/modal-create-project.component";
import {ModalFileBrowserComponent} from "../modal-file-browser/modal-file-browser.component";

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.styl']
})
export class ControlBarComponent implements OnInit {

  public projects : Project[];
  public selectedProject : Project;
  public mapMouseLocation: LatLng = new LatLng(0,0);

  constructor(private ProjectsService : ProjectsService,
              private GeoDataService: GeoDataService,
              private bsModalService: BsModalService) { }

  ngOnInit() {
    this.ProjectsService.getProjects();
    this.ProjectsService.projects.subscribe( (projects)=> {
      this.projects = projects;

      if (this.projects.length){
        this.ProjectsService.setActiveProject(this.projects[0])
      }
    });

    this.ProjectsService.activeProject.subscribe(next=>{
      this.selectedProject = next;
    });

    this.GeoDataService.mapMouseLocation.pipe(skip(1)).subscribe( (next)=>{
      this.mapMouseLocation = next;
    });
  }

  selectProject(p: Project) : void {
    this.ProjectsService.setActiveProject(p);
    this.GeoDataService.getAllFeatures(p.id);
    this.GeoDataService.getOverlays(p.id);
  }

  openCreateProjectModal() {
    this.bsModalService.show(ModalCreateProjectComponent);
  }

  openFileBrowserModal() {
    this.bsModalService.show(ModalFileBrowserComponent);
  }

}
