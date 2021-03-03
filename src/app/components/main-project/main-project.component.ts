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
    this.projectsService.projects.subscribe((projects) => {
      if (projects && projects.length > 0) {
        this.projects = projects;
      } else {
        this.router.navigate(['']);
      }
    });

    this.geoDataService.activeFeature.subscribe(next => {
      this.activeFeature = next;
    });

    // NOTE: This is (maybe) racey and should wait until project is active (maybe not?)
    // NOTE: When projects do not exist, the above code should redirect to root
    // FIXME: There's a bug related to switching projects and the tile-servers implementation
    //        Tiles don't hide on switch
    // FIXME: There's a bug related to manually going to a URL because the default logic is
    //        to select first project in the projects list (in controlbarcomponent)
    if (this.projects) {
      const activeProject = this.projects.find((p) => {
        return this.route.snapshot.paramMap.get('projectUUID') === p.uuid;
      });

      this.projectsService.setActiveProject(activeProject);
    } else {
      // NOTE: probably don't need
      this.router.navigate(['']);
    }
  }

}
