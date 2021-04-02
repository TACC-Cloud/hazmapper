import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Feature} from '../../models/models';
import {ProjectsService} from '../../services/projects.service';
import {GeoDataService} from '../../services/geo-data.service';

@Component({
  selector: 'app-main-project',
  templateUrl: './main-project.component.html',
  styleUrls: ['./main-project.component.styl']
})
export class MainProjectComponent implements OnInit {
  public activeFeature: Feature;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private projectsService: ProjectsService,
              private geoDataService: GeoDataService) { }

  ngOnInit() {
    const projectUUID = this.route.snapshot.paramMap.get('projectUUID');
    this.projectsService.setActiveProjectUUID(projectUUID);
    this.geoDataService.activeFeature.subscribe(next => {
      this.activeFeature = next;
    });
  }
}
