import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geo-data.service';
import { Feature, IFileImportRequest, Project } from '../../models/models';
import { ProjectsService } from '../../services/projects.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-foundation';
import { ModalFileBrowserComponent } from '../modal-file-browser/modal-file-browser.component';
import { RemoteFile } from 'ng-tapis';
import { TapisFilesService } from '../../services/tapis-files.service';
import { EnvService } from '../../services/env.service';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl'],
})
export class AssetDetailComponent implements OnInit {
  @Input() isPublicView = false;
  feature: Feature;
  featureSource: string;
  activeProject: Project;
  safePointCloudUrl: SafeResourceUrl;
  constructor(
    private geoDataService: GeoDataService,
    private tapisFilesService: TapisFilesService,
    private projectsService: ProjectsService,
    private bsModalService: BsModalService,
    private envService: EnvService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.geoDataService.activeFeature.subscribe((next) => {
      this.feature = next;
      try {
        let featureSource = this.envService.apiUrl + '/assets/' + this.feature.assets[0].path;
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
    this.projectsService.activeProject.subscribe((current) => {
      this.activeProject = current;
    });
  }

  openFileBrowserModal() {
    const modalConfig: ModalOptions = {
      initialState: {
        single: true,
        allowedExtensions: this.tapisFilesService.IMPORTABLE_FEATURE_ASSET_TYPES,
      },
    };
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent, modalConfig);
    modal.content.onClose.subscribe((file: RemoteFile) => {
      const payload: IFileImportRequest = {
        system_id: file[0].system,
        path: file[0].path,
      };
      this.geoDataService.importFeatureAsset(this.activeProject.id, Number(this.feature.id), payload);
    });
  }

  close() {
    this.geoDataService.activeFeature = null;
  }
}
