import { Component, OnInit } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Overlay, Project, TileServer} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateOverlayComponent} from '../modal-create-overlay/modal-create-overlay.component';
import {ModalCreateTileServerComponent} from '../modal-create-tile-server/modal-create-tile-server.component';
import {ProjectsService} from '../../services/projects.service';

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {

  basemap: string;
  overlays: Array<Overlay>;
  tileServers: Array<TileServer>;
  environment: AppEnvironment;
  activeProject: Project;
  dragging: TileServer;
  draggedOver: TileServer;

  constructor(private geoDataService: GeoDataService,
              private bsModalService: BsModalService,
              private projectsService: ProjectsService) {

  }

  ngOnInit() {
    this.environment = environment;
    this.geoDataService.overlays.subscribe((ovs) => {
      this.overlays = ovs;
    });

    this.geoDataService.tileServers.subscribe((tsv) => {
      this.tileServers = tsv;
    });

    this.geoDataService.basemap.subscribe( (next) => {
      this.basemap = next;
    });
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
  }

  selectBasemap(bmap: string): void {
    this.basemap = bmap;
    this.geoDataService.basemap = this.basemap;
  }

  selectOverlay(ov): void {
    ov.isActive = !ov.isActive;
    this.geoDataService.selectOverlay(ov);
  }

  deleteOverlay(ov: Overlay) {
    this.geoDataService.deleteOverlay(this.activeProject.id, ov);
  }

  deleteLayer(name: string): void {
    this.geoDataService.deleteTileServer(name);
  }

  toggleLayerActivate(name: string): void {
    this.geoDataService.toggleTileServer(name);
  }

  // TODO (for setDragElement, setDragOverElement, dropEleemnt): change name to tileserver related things
  // TODO: Change to ID
  setDragElement(name: string): void {
    this.dragging = this.tileServers.filter(ts => ts.name == name)[0];
  }

  // TODO: Change to ID
  setDragOverElement(e: any, name: string): void {
    e.preventDefault();
    this.draggedOver = this.tileServers.filter(ts => ts.name == name)[0];
  }

  dropElement() {
    let index1 = this.tileServers.indexOf(this.dragging);
    let index2 = this.tileServers.indexOf(this.draggedOver);
    this.dragging.zIndex = index2;
    this.draggedOver.zIndex = index1;
    this.tileServers.splice(index1, 1)
    this.tileServers.splice(index2, 0, this.dragging)
    this.geoDataService.updateTileServer(this.tileServers);
  }

  openCreateOverlayModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateOverlayComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
    });
  }

  openCreateTileServerModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateTileServerComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
    });
  }
}
