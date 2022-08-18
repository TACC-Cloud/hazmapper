import {Component, Input, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-foundation';
import {IPointCloud} from '../../models/models';

@Component({
  selector: 'app-modal-point-cloud-info',
  templateUrl: './modal-point-cloud-info.component.html',
  styleUrls: ['./modal-point-cloud-info.component.styl']
})
export class ModalPointCloudInfoComponent implements OnInit {

  @Input() pc: IPointCloud;
  fileInfo: null;

  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.fileInfo = JSON.parse(this.pc.files_info);
  }

  close() {
    this.bsModalRef.hide();
  }

}
