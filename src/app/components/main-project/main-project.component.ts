import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from '../../models/models';
import {Feature} from '../../models/models';
import {ProjectsService} from '../../services/projects.service';
import {GeoDataService} from '../../services/geo-data.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-main-project',
  templateUrl: './main-project.component.html',
  styleUrls: ['./main-project.component.styl']
})
export class MainProjectComponent implements OnInit {

  public activeFeature: Feature;
  selectedId: number;
  public projects: Array<Project>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private projectsService: ProjectsService,
              private geoDataService: GeoDataService) { }

  ngOnInit() {
    this.projectsService.projects.subscribe( (projects) => {
      if (projects && projects.length > 0) {
        this.projects = projects;
      } else {
        this.router.navigate(['']);
      }
    });

    let activeProject = this.projects.find((p) => {
      return parseInt(this.route.snapshot.paramMap.get('projectId')) == p.id;
    });

    this.projectsService.setActiveProject(activeProject);

    this.geoDataService.activeFeature.subscribe( next => {
      this.activeFeature = next;
    });
  }

}
