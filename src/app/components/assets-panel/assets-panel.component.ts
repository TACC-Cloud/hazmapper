import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from 'geojson';
import {GeoDataService} from '../../services/geo-data.service';
import {FeatureAsset, Feature, Project} from '../../models/models';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import { ModalCreatePointCloudComponent} from '../modal-create-point-cloud/modal-create-point-cloud.component';
import {ProjectsService} from '../../services/projects.service';
import {RemoteFile} from 'ng-tapis';
import { ScrollableArray } from '../../utils/ScrollableArray';


@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl']
})
export class AssetsPanelComponent implements OnInit {
  features: FeatureCollection;
  activeFeature: Feature;
  scrollableFeatures: ScrollableArray<Feature> = new ScrollableArray([]);
  displayFeatures: Array<Feature>;
  activeProject: Project;

  constructor(private geoDataService: GeoDataService, private bsModalService: BsModalService, private projectsService: ProjectsService) { }

  ngOnInit() {
    this.scrollableFeatures.currentSelection.subscribe( (next: Array<Feature>) => {
      this.displayFeatures = next;
    });
    this.geoDataService.features.subscribe( (fc: FeatureCollection) => {
      this.features = fc;
      this.scrollableFeatures.setContent(this.features.features);
    });
    this.geoDataService.activeFeature.subscribe( (next) => {
      this.activeFeature = next;
      if (this.activeFeature) { this.scrollToActiveFeature(); }
    });
    this.projectsService.activeProject.subscribe( (current) => {
      this.activeProject = current;
    });
  }

  scrollToActiveFeature() {
    this.scrollableFeatures.scrollTo(this.activeFeature);
  }

  scrollDown() {
    this.scrollableFeatures.scrollDown();
  }

  scrollUp() {
    this.scrollableFeatures.scrollUp();
  }

  openFileBrowserModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent);
    modal.content.onClose.subscribe( (files: Array<RemoteFile>) => {
      this.geoDataService.importFileFromTapis(this.activeProject.id, files);
    });
  }

  openPointCloudCreateModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreatePointCloudComponent);
    // modal.content.onClose.subscribe( (files: Array<RemoteFile>) => {
    //   this.geoDataService.importFileFromTapis(this.activeProject.id, files);
    // });
  }

  handleFileInput(files: FileList) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.geoDataService.uploadFile(this.activeProject.id, files[i]);
    }
  }

  exportGeoJSON() {
    this.geoDataService.downloadGeoJSON(this.activeProject.id);
  }

  selectFeature(feat) {
    this.geoDataService.activeFeature = feat;
  }

}
