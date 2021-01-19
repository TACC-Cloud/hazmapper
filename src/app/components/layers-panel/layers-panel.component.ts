import { Component, OnInit, ElementRef, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Overlay, Project, TileServer} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateOverlayComponent} from '../modal-create-overlay/modal-create-overlay.component';
import {RemoteFile} from 'ng-tapis';
import {ModalCreateTileServerComponent} from '../modal-create-tile-server/modal-create-tile-server.component';
import {ProjectsService} from '../../services/projects.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {TapisFilesService} from '../../services/tapis-files.service';

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {
  @ViewChildren('activeText') activeInputs: QueryList<ElementRef>;

  basemap: string;
  dirtyOptions: boolean;
  overlays: Array<Overlay>;
  tileServers: Array<TileServer>;
  environment: AppEnvironment;
  activeProject: Project;
  modalRef: BsModalRef;

  constructor(private geoDataService: GeoDataService,
              private bsModalService: BsModalService,
              private projectsService: ProjectsService,
              private tapisFilesService: TapisFilesService) {
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

    this.geoDataService.dirtyTileOptions.subscribe( (next) => {
      this.dirtyOptions = next;
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

  deleteTileServer(ts: TileServer): void {
    this.geoDataService.selectedTileServer = ts;
    this.geoDataService.deleteTileServer(this.activeProject.id, ts.id);
  }

  toggleTileServer(ts: TileServer): void {
    this.geoDataService.toggleTileServer(this.activeProject.id, ts);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tileServers, event.previousIndex, event.currentIndex);
    // TODO: Figure out a better way to handle ZIndex
    // let zIndexMax = this.tileServers.length;
    let zIndexMax = 0;
    this.tileServers.forEach(ts => {
      ts.uiOptions.zIndex = zIndexMax;
      zIndexMax--;
    });

    this.geoDataService.updateTileServers(this.activeProject.id, this.tileServers);
  }

  openCreateOverlayModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateOverlayComponent);
    modal.content.onClose.subscribe( (next) => {
      console.log(next);
    });
  }

  openCreateTileServerModal() {
    const modal: BsModalRef = this.bsModalService.show(ModalCreateTileServerComponent);
    modal.content.onClose.subscribe( (files: Array<RemoteFile>) => {
      if (files != null) {
        this.geoDataService.importFileFromTapis(this.activeProject.id, files);
      }
    });
  }

  openDeleteTileServerModal(template: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(template, {class: 'tiny'});
  }

  updateName(name: string, ts: TileServer) {
    // TODO: Handle longer names
    this.showInput(ts, false);
    name = name.trim();
    if (name.length < 512) {
      if (name && name != ts.name) {
        ts.name = name;
        this.geoDataService.updateTileServer(this.activeProject.id, ts);
      }
    }
  }

  showInput(ts: TileServer, show: boolean) {
    ts.uiOptions.showInput = show;

    // NOTE: Assumes only single active input at a time (due to blur)
    if (show) {
      setTimeout(() => {
        this.activeInputs.first.nativeElement.focus();
        this.activeInputs.first.nativeElement.select();
      }, 1);
    }
  }

  setLayerOpacity(ts: TileServer, opacity: number) {
    ts.uiOptions.opacity = opacity;
    this.geoDataService.updateTileServer(this.activeProject.id, ts);
  }

  toggleDescription(ts: TileServer) {
    ts.uiOptions.showDescription = !ts.uiOptions.showDescription;
  }

  changeMovePointer(gripHandle: any, what: boolean) {
    gripHandle.style.cursor = what ? 'move' : 'auto';
  }

  saveTileOptions() {
    this.geoDataService.saveTileServers(this.activeProject.id, this.tileServers);
  }
}
