import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geo-data.service';
import { Feature, IFileImportRequest, Project } from '../../models/models';
import { ProjectsService } from '../../services/projects.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-foundation';
import { ModalFileBrowserComponent } from '../modal-file-browser/modal-file-browser.component';
import { ModalQuestionnaireViewerComponent } from '../modal-questionnaire-viewer/modal-questionnaire-viewer.component';
import { RemoteFile } from 'ng-tapis';
import { TapisFilesService } from '../../services/tapis-files.service';
import { EnvService } from '../../services/env.service';
import { PathTree } from '../../models/path-tree';

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
  title: string;
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

        if (this.feature.assets.length && this.feature.assets[0].display_path) {
          const fileName = this.extractFileName(this.feature.assets[0].display_path);
          this.title = fileName;
        } else {
          this.title = this.feature.id.toString();
        }
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

  openQuestionnaireModal(feature: Feature) {
    const modalConfig: ModalOptions = {
      initialState: {
        feature,
      },
    };

    this.bsModalService.show(ModalQuestionnaireViewerComponent, modalConfig);
  }

  extractFileName(path: string): string {
    const pathSegments = path.split('/');
    return pathSegments.pop();
  }

  close() {
    this.geoDataService.activeFeature = null;
  }
}
