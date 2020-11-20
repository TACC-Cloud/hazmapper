import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {Subject} from 'rxjs';
import {filter, first, map, take, toArray} from 'rxjs/operators';
import {TapisFilesService} from "../../services/tapis-files.service";
import {TileServer} from '../../models/models';
import { GeoDataService} from '../../services/geo-data.service';
import {RemoteFile} from "ng-tapis";

@Component({
  selector: 'app-modal-create-tile-server',
  templateUrl: './modal-create-tile-server.component.html',
  styleUrls: ['./modal-create-tile-server.component.styl']
})
export class ModalCreateTileServerComponent implements OnInit {
  remoteFileData: Array<RemoteFile> = new Array<RemoteFile>();
  tsCreateForm: FormGroup;
  importMethod: string = 'manual';
  serverType: string = 'tms';
  qmsSearchResults: Array<any>;
  qmsServerResult: any = {};
  qmsOrdering: string = 'name';
  qmsOrder: string = '';
  public readonly onClose: Subject<any> = new Subject<any>();
  constructor(private bsModalRef: BsModalRef,
              private tapisFilesService: TapisFilesService,
              private geoDataService: GeoDataService,
              private bsModalService: BsModalService) { }


  ngOnInit() {
    this.geoDataService.qmsSearchResults.subscribe((next) => {
      if (next) {
        this.qmsSearchResults = next;
        this.qmsSearchResults.map(n => n.show = false);
      }
    });

    this.geoDataService.qmsServerResult.subscribe((next) => {
      if (next) {
        this.qmsSearchResults = null;
        this.bsModalRef.hide();
      }
    });

    this.tsCreateForm = new FormGroup( {
      method: new FormControl('manual'),
      type: new FormControl('tms'),
      name: new FormControl(''),
      ordering: new FormControl('name'),
      order: new FormControl(''),
      url: new FormControl(''),
      layers: new FormControl(''),
      maxZoom: new FormControl(18),
      minZoom: new FormControl(0),
      attribution: new FormControl(''),
      attributionLink: new FormControl(''),
      attributionExtra: new FormControl('')
    });
  }

  onDSFileSelection(files: Array<RemoteFile>) {
    this.remoteFileData = files;
  }

  setMethod() {
    this.importMethod = this.tsCreateForm.get('method').value;
  }

  setServer() {
    this.serverType = this.tsCreateForm.get('type').value;
  }

  close() {
    this.bsModalRef.hide();
  }

  searchQMS(ev: any, query: string) {
    ev.preventDefault();
    let qmsQueryOptions = {
      type: this.serverType,
      ordering: this.qmsOrdering,
      order: this.qmsOrder
    }
    this.geoDataService.getQMS(query, qmsQueryOptions);
  }

  addQMSServer(qs: any) {
    this.qmsSearchResults = null;
    console.log(this.qmsSearchResults);
    this.geoDataService.getQMSTileServer(qs.id);
  }

  submit() {
    // TODO: Refactor this to be less ugly.
    let copyright = '';
    if (this.tsCreateForm.get('attribution').value) {
      copyright = '&copy; '
      if (this.tsCreateForm.get('attributionLink').value) {
        copyright = copyright + "<a href=\"" +
          this.tsCreateForm.get('attributionLink').value +
          ">" + copyright + this.tsCreateForm.get('attribution').value + "</a>";
      } else {
        copyright += copyright + this.tsCreateForm.get('attribution').value;
      }

      if (this.tsCreateForm.get('attributionExtra').value) {
        copyright += this.tsCreateForm.get('attributionExtra').value;
      }
    }

    const tileServer: TileServer = {
      name: this.tsCreateForm.get('name').value,
      id: 0,
      url: this.tsCreateForm.get('url').value,
      attribution: copyright,
      type: this.tsCreateForm.get('type').value,
      layers: this.tsCreateForm.get('layers').value,
      default: false,
      zIndex: 0,
      maxZoom: this.tsCreateForm.get("maxZoom").value,
      minZoom: this.tsCreateForm.get("minZoom").value,
      isActive: false
    };

    this.geoDataService.addTileServer(tileServer);
    this.onClose.next(null);
    this.bsModalRef.hide();
  }
}
