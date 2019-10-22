import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from 'geojson';
import {GeoDataService} from '../../services/geo-data.service';
import {AssetFilters, Feature, Project} from '../../models/models';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import {ProjectsService} from '../../services/projects.service';
import {RemoteFile} from 'ng-tapis';
import {Subject} from 'rxjs';



class ScrollableArray<T> {

  private windowSize = 200;
  private fetchSize = 100;
  private content: Array<T> = [];
  public readonly length: number = this.content.length;
  private startIdx  = 0;
  public readonly currentSelection: Subject<Array<T>> = new Subject();

  constructor(data: Array<T>) {
    this.content = data;
  }

  setContent(data: Array<T>) {
    this.content = data;
    this.startIdx = 0;

    this.currentSelection.next(this.content.slice(this.startIdx, this.windowSize));
  }

  setFetchSize(num: number) {
    this.fetchSize = num;
  }

  setWindowSize(num: number) {
    this.windowSize = num;
  }

  scrollTo(target: any) {
    const idx: number = this.content.indexOf(target);
    if (idx >= 0) {
      // this.startIdx = idx;
      this.startIdx = Math.min(this.content.length - this.fetchSize, idx);
      this.currentSelection.next(this.content.slice(this.startIdx, this.startIdx + this.windowSize));
    }
  }

  scrollUp() {
    this.startIdx = Math.max(0, this.startIdx - this.fetchSize);
    const tmp = this.content.slice(this.startIdx, this.startIdx + this.windowSize);
    this.currentSelection.next(tmp);  }

  scrollDown() {
    this.startIdx = Math.min(this.content.length - this.fetchSize, this.startIdx + this.fetchSize);
    const tmp = this.content.slice(this.startIdx, this.startIdx + this.windowSize);
    this.currentSelection.next(tmp);
  }

}



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
      console.log(fc);
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
