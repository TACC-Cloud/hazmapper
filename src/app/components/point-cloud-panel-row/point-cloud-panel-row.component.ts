import {Component, Input, OnInit} from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {IPointCloud} from '../../models/models';

@Component({
  selector: 'app-point-cloud-panel-row',
  templateUrl: './point-cloud-panel-row.component.html',
  styleUrls: ['./point-cloud-panel-row.component.styl']
})
export class PointCloudPanelRowComponent implements OnInit {

  @Input() pc: IPointCloud;

  constructor(private geoDataService: GeoDataService) { }

  ngOnInit() {}

  addFile(files) {
    console.log(this.pc);
    const fileToUpload = files.item(0);
    this.geoDataService.addFileToPointCloud(this.pc, fileToUpload);
  }

  delete() {
    this.geoDataService.deletePointCloud(this.pc);
  }

}
