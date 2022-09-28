import { Component, Input, OnInit } from '@angular/core';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../models/models';
import { IpanelsDisplay } from '../../models/ui';
import { GeoDataService } from 'src/app/services/geo-data.service';

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.styl'],
})
export class DockComponent implements OnInit {
  @Input() isPublicView = false;
  panelsDisplay: IpanelsDisplay;
  activeProject: Project;
  existingFeatureTypes: Record<string, boolean>;

  constructor(private projectsService: ProjectsService, private geoDataService: GeoDataService) {}

  ngOnInit() {
    this.projectsService.activeProject.subscribe((next) => {
      this.activeProject = next;
      if (!this.activeProject) {
        this.projectsService.disablePanelsDisplay();
      }
    });

    this.geoDataService.existingFeatureTypes.subscribe((next) => {
      this.existingFeatureTypes = next;
    });

    this.projectsService.panelsDisplay.subscribe((next) => {
      this.panelsDisplay = next;
    });
  }

  showPanel(pname: string) {
    this.projectsService.setPanelsDisplay(pname);
  }
}
