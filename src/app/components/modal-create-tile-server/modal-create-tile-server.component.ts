import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {Subject} from 'rxjs';
import {filter, first, map, take, toArray} from 'rxjs/operators';
import {TapisFilesService} from '../../services/tapis-files.service';
import {TileServer, Project} from '../../models/models';
import {GeoDataService} from '../../services/geo-data.service';
import {ProjectsService} from '../../services/projects.service';
import {RemoteFile} from 'ng-tapis';
import {defaultTileServers, suggestedTileServers} from '../../constants/tile-servers';

@Component({
  selector: 'app-modal-create-tile-server',
  templateUrl: './modal-create-tile-server.component.html',
  styleUrls: ['./modal-create-tile-server.component.styl']
})
export class ModalCreateTileServerComponent implements OnInit {
  remoteFileData: Array<RemoteFile> = new Array<RemoteFile>();
  tsCreateForm: FormGroup;
  activeProject: Project;
  defaultServers: ReadonlyArray<TileServer> = defaultTileServers;
  suggestedServers: ReadonlyArray<TileServer> = suggestedTileServers;
  qmsSearchResults: Array<any>;
  public readonly onClose: Subject<any> = new Subject<any>();

  constructor(private bsModalRef: BsModalRef,
              private tapisFilesService: TapisFilesService,
              private geoDataService: GeoDataService,
              private projectsService: ProjectsService,
              private bsModalService: BsModalService) { }


  ngOnInit() {
    this.geoDataService.qmsSearchResults.subscribe((next) => {
      if (next) {
        this.qmsSearchResults = next;
        this.qmsSearchResults.map(n => n.show = false);
      }
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.geoDataService.qmsServerResult.subscribe((next) => {
      if (next) {
        this.qmsSearchResults = null;
        this.bsModalRef.hide();
      }
    });

    this.tsCreateForm = new FormGroup( {
      method: new FormControl('suggestions'),
      type: new FormControl('tms'),
      name: new FormControl(''),
      ordering: new FormControl('name'),
      order: new FormControl(''),
      url: new FormControl(''),
      layers: new FormControl(null),
      params: new FormControl(null),
      format: new FormControl(null),
      maxZoom: new FormControl(null),
      minZoom: new FormControl(null),
      attribution: new FormControl(''),
      attributionLink: new FormControl(''),
    });
  }

  onDSFileSelection(files: Array<RemoteFile>) {
    this.remoteFileData = files;
  }

  close() {
    this.bsModalRef.hide();
  }

  searchQMS(ev: any, query: string) {
    ev.preventDefault();
    let qmsQueryOptions = {
      type: this.tsCreateForm.get('type').value,
      ordering: this.tsCreateForm.get('ordering').value,
      order: this.tsCreateForm.get('order').value,
    }
    this.geoDataService.searchQMS(query, qmsQueryOptions);
  }

  addQMSServer(qs: any) {
    this.qmsSearchResults = null;
    this.geoDataService.getQMSTileServer(this.activeProject.id, qs.id);
  }

  addSuggestedServer(ev: any, ts: TileServer) {
    ev.preventDefault();
    this.geoDataService.addTileServer(this.activeProject.id, ts);
    this.onClose.next(null);
    this.bsModalRef.hide();
  }

  removeTags(str: string) {
    return str.replace( /(<([^>]+)>)/ig, '');
  };

  generateAttribution() {
    let copyright = '';

    const attributionText = this.removeTags(this.tsCreateForm.get('attribution').value);
    const attributionLink = this.removeTags(this.tsCreateForm.get('attributionLink').value);

    if (attributionText) {
      copyright = '&copy; '
      if (attributionLink) {
        copyright += '<a href=\"' + attributionLink + '\">';
        copyright += attributionText + '</a>';
      } else {
        copyright += copyright + attributionText;
      }
    }

    return copyright;
  }

  tileServerFromForm() {
    const tileServer: TileServer = {
      name: this.tsCreateForm.get('name').value,
      type: this.tsCreateForm.get('type').value,
      url: this.tsCreateForm.get('url').value,
      attribution: this.generateAttribution(),

      tileOptions: {
        maxZoom: this.tsCreateForm.get('maxZoom').value,
        minZoom: this.tsCreateForm.get('minZoom').value,
        layers: this.tsCreateForm.get('layers').value,
        params: this.tsCreateForm.get('params').value,
        format: this.tsCreateForm.get('format').value,
      },

      uiOptions: {
        opacity: 0.5,
        isActive: true,
        showDescription: false,
        showInput: false
      }
    };

    return tileServer;
  }

  submit() {
    let importMethod = this.tsCreateForm.get('method').value;
    if (importMethod == 'manual') {
      let tileServer = this.tileServerFromForm();
      this.geoDataService.addTileServer(this.activeProject.id, tileServer);
      this.onClose.next(null);
    } else if (importMethod == 'ini') {
      this.onClose.next(this.remoteFileData);
    }

    this.bsModalRef.hide();
  }
}
