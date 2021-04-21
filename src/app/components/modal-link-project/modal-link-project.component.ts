import {Component, Input, OnInit} from '@angular/core';
import { RemoteFile} from 'ng-tapis/models/remote-file';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { TapisFilesService } from '../../services/tapis-files.service';
import {ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-modal-link-project',
  templateUrl: './modal-link-project.component.html',
  styleUrls: ['./modal-link-project.component.styl']
})
export class ModalLinkProjectComponent implements OnInit {
  @Input() allowedExtensions: Array<string> = this.tapisFilesService.IMPORTABLE_FEATURE_TYPES;
  @Input() single: false;
  @Input() allowFolders: false;
  @Input() onlyFolder: false;
  @Input() allowEmptyFiles: false;
  selectedFiles: Array<RemoteFile> = [];
  selectedSystem: any;
  linkProject: boolean = false;
  public onClose: Subject<any> = new Subject<any>();
  constructor(private modalRef: BsModalRef,
              private tapisFilesService: TapisFilesService,
              private cdref: ChangeDetectorRef ) { }

  ngOnInit() {
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  onSelect(items: Array<RemoteFile>) {
    this.selectedFiles = items;
  }

  onSystemSelect(system: any) {
    this.selectedSystem = system;
  }

  testIt(hw) {
    console.log(hw.disabled);
  }

  close() {
    this.onClose.next({
      fileList: this.selectedFiles,
      linkProject: this.linkProject,
      system: this.selectedSystem
    });
    this.modalRef.hide();
  }

  cancel() {
    this.modalRef.hide();
  }
}
