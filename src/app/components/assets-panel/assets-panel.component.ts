import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from 'geojson';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature, Project} from '../../models/models';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import {ProjectsService} from '../../services/projects.service';

@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl']
})
export class AssetsPanelComponent implements OnInit {
  features: FeatureCollection;
  activeFeature: Feature;
  displayFeatures: Array<Feature>;
  activeProject: Project;
  count = 200;
  scrollStep = 200;

  constructor(private geoDataService: GeoDataService, private bsModalService: BsModalService, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.geoDataService.features.subscribe( (fc: FeatureCollection) => {
      console.log(fc);
      this.features = fc;
      this.displayFeatures = this.features.features.slice(0, this.count);
    });
    this.geoDataService.activeFeature.subscribe( (next) => {
      this.activeFeature = next;
    });

    this.projectsService.activeProject.subscribe( (current) => {
      this.activeProject = current;
    });

  }

  // TODO: Implement onScrollUp and scrolling to the right feature when a marker is clicked on the map
  onScroll() {
    console.log(this.displayFeatures.length);

    this.displayFeatures.push(...this.features.features.slice(this.count, this.count + this.scrollStep));
    this.count += this.scrollStep;
  }

  trackByFn(index: number, feat: Feature): number {
    return <number> feat.id;
  }

  openFileBrowserModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
    });
  }

  handleFileInput(files: FileList) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.geoDataService.uploadFile(this.activeProject.id, files[i]);
    }
  }


  selectFeature(feat) {
    this.geoDataService.activeFeature = feat;
  }

}
