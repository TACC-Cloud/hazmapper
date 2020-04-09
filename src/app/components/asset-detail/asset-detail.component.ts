import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Feature, Project} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {ProjectsService} from '../../services/projects.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-foundation';
import {ModalFileBrowserComponent} from '../modal-file-browser/modal-file-browser.component';
import {RemoteFile} from 'ng-tapis';
import {TapisFilesService} from '../../services/tapis-files.service';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  environment: AppEnvironment;
  feature: Feature;
  featureSource: string;
  activeProject: Project;
  safePointCloudUrl: SafeResourceUrl;
  constructor(private geoDataService: GeoDataService,
              private tapisFilesService: TapisFilesService,
              private projectsService: ProjectsService,
              private bsModalService: BsModalService,
              public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.environment = environment;
    this.geoDataService.activeFeature.subscribe( (next) => {
      this.feature = next;
      try {
        let featureSource = this.environment.apiUrl + '/assets/' + this.feature.assets[0].path;
        // Strip out any possible double slashes or wso2 gets messed up
        featureSource = featureSource.replace(/([^:])(\/{2,})/g, '$1/');
        this.featureSource = featureSource;

        if (this.feature.featureType() === 'point_cloud') {
          this.safePointCloudUrl = this.sanitizer.bypassSecurityTrustResourceUrl(featureSource + '/preview.html');
        } else {
          this.safePointCloudUrl = null;
        }
      } catch (e) {
        this.featureSource = null;
        this.safePointCloudUrl = null;
      }
    });
    this.projectsService.activeProject.subscribe( (current) => {
      this.activeProject = current;
    });
  }

  // handleAssetFileInput(files: FileList) {
  //   // tslint:disable-next-line:prefer-for-of
  //   for (let i = 0; i < files.length; i++) {
  //     this.geoDataService.uploadAssetFile(this.activeProject.id, Number(this.feature.id), files[i]);
  //   }
  // }

  openFileBrowserModal() {
    const modalConfig: ModalOptions = {
      initialState: {
        single: true,
        allowedExtensions: this.tapisFilesService.IMPORTABLE_FEATURE_ASSET_TYPES
      }
    };
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent, modalConfig);
    modal.content.onClose.subscribe( (files: Array<RemoteFile>) => {
      this.geoDataService.importFileFromTapis(this.activeProject.id, files);
    });
  }

  close() {
    this.geoDataService.activeFeature = null;
  }


}
