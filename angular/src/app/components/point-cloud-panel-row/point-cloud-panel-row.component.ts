import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geo-data.service';
import { IPointCloud } from '../../models/models';
import { BsModalRef, BsModalService } from 'ngx-foundation';
import { ModalPointCloudInfoComponent } from '../modal-point-cloud-info/modal-point-cloud-info.component';
import { ModalFileBrowserComponent } from '../modal-file-browser/modal-file-browser.component';
import { RemoteFile } from 'ng-tapis';
import { TapisFilesService } from '../../services/tapis-files.service';

@Component({
  selector: 'app-point-cloud-panel-row',
  templateUrl: './point-cloud-panel-row.component.html',
  styleUrls: ['./point-cloud-panel-row.component.styl'],
})
export class PointCloudPanelRowComponent implements OnInit {
  @Input() pc: IPointCloud;

  constructor(
    private geoDataService: GeoDataService,
    private bsModalService: BsModalService,
    private tapisFilesService: TapisFilesService
  ) {}

  ngOnInit() {}

  openFileBrowserModal() {
    const initialState = {
      allowedExtensions: this.tapisFilesService.IMPORTABLE_POINT_CLOUD_TYPES,
    };
    const modal: BsModalRef = this.bsModalService.show(ModalFileBrowserComponent, { initialState });
    modal.content.onClose.subscribe((files: Array<RemoteFile>) => {
      this.geoDataService.importPointCloudFileFromTapis(this.pc.project_id, this.pc.id, files);
    });
  }

  addFile(files: FileList) {
    // tslint:disable-next-line
    for (const i in files) {
      this.geoDataService.addFileToPointCloud(this.pc, files[i]);
    }
  }

  delete() {
    this.geoDataService.deletePointCloud(this.pc);
  }

  openPointCloudInfoModal() {
    const initialState = {
      pc: this.pc,
    };
    const modal: BsModalRef = this.bsModalService.show(ModalPointCloudInfoComponent, { initialState });
  }
}
