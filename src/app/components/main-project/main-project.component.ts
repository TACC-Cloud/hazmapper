import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, UrlSegment} from '@angular/router';
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
  private isPublicView = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private projectsService: ProjectsService,
              private geoDataService: GeoDataService) { }

  ngOnInit() {
    const projectUUID = this.route.snapshot.paramMap.get('projectUUID');
    const publicProjectURlSegment = this.route.snapshot.url.filter( (segment: UrlSegment) => segment.path === 'project-public');
    this.isPublicView = Array.isArray(publicProjectURlSegment) && publicProjectURlSegment.length >= 1;
    this.projectsService.setActiveProjectUUID(projectUUID, this.isPublicView);
    this.geoDataService.activeFeature.subscribe(next => {
      this.activeFeature = next;
    });
  }
}
