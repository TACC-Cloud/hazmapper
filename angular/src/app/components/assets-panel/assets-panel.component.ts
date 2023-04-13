import { Component, Input, OnInit } from '@angular/core';
import { FeatureCollection } from 'geojson';
import { GeoDataService } from '../../services/geo-data.service';
import { Feature, Project } from '../../models/models';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { ModalFileBrowserComponent } from '../modal-file-browser/modal-file-browser.component';
import { ProjectsService } from '../../services/projects.service';
import { RemoteFile } from 'ng-tapis';
import { ScrollableArray } from '../../utils/ScrollableArray';
import { PathTree } from '../../models/path-tree';
import { TapisFilesService } from '../../services/tapis-files.service';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl'],
})
export class AssetsPanelComponent implements OnInit {
  @Input() isPublicView = false;
  features: FeatureCollection;
  activeFeature: Feature;
  scrollableFeatures: ScrollableArray<Feature> = new ScrollableArray([]);
  displayFeatures: Array<Feature>;
  activeProject: Project;
  currentTreeListing: PathTree<Feature>;

  constructor(
    private geoDataService: GeoDataService,
    private bsModalService: BsModalService,
    private streetviewService: StreetviewService,
    private projectsService: ProjectsService,
    private tapisFilesService: TapisFilesService
  ) {}

  ngOnInit() {
    this.scrollableFeatures.currentSelection.subscribe((next: Array<Feature>) => {
      this.displayFeatures = next;
    });
    this.geoDataService.features.subscribe((fc: FeatureCollection) => {
      this.features = fc;
      this.scrollableFeatures.setContent(this.features.features);
    });
    this.geoDataService.activeFeature.subscribe((next) => {
      this.activeFeature = next;
      if (this.activeFeature) {
        this.scrollToActiveFeature();
      }
    });
    this.projectsService.activeProject.subscribe((current) => {
      this.activeProject = current;
    });

    this.geoDataService.featureTree$.subscribe((next) => {
      this.currentTreeListing = next;
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
    const initialState = {
      allowedExtensions: this.tapisFilesService.IMPORTABLE_FEATURE_TYPES,
    };
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent, { initialState });
    modal.content.onClose.subscribe((files: Array<RemoteFile>) => {
      this.geoDataService.importFileFromTapis(this.activeProject.id, files);
    });
  }

  exportGeoJSON() {
    this.geoDataService.downloadGeoJSON(this.activeProject.id);
  }

  selectTreeNode(node: PathTree<Feature>) {
    if (node.getPayload().featureType() === 'streetview') {
      this.geoDataService.activeFeature = null;
      this.streetviewService.sequenceFeatureToActiveAsset(node.getPayload()).subscribe(
        (asset) => {
          this.streetviewService.activeAsset = asset;
        },
        (err) => console.log(err)
      );
    } else {
      this.streetviewService.activeAsset = null;
      this.geoDataService.activeFeature = node.getPayload();
    }
  }
}
