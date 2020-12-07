import { Component, OnInit, ElementRef, ViewChildren, QueryList} from '@angular/core';
import {GeoDataService} from '../../services/geo-data.service';
import {Overlay, Project, TileServer} from '../../models/models';
import {AppEnvironment, environment} from '../../../environments/environment';
import {BsModalRef, BsModalService} from 'ngx-foundation';
import {ModalCreateOverlayComponent} from '../modal-create-overlay/modal-create-overlay.component';
import {ModalCreateTileServerComponent} from '../modal-create-tile-server/modal-create-tile-server.component';
import {ProjectsService} from '../../services/projects.service';
import {CdkDragDrop, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {
  @ViewChildren('activeText') activeInputs: QueryList<ElementRef>;

  basemap: string;
  overlays: Array<Overlay>;
  tileServers: Array<TileServer>;
  environment: AppEnvironment;
  activeProject: Project;
  disableDragging: boolean = false;
  inputShown: boolean = false;

  constructor(private geoDataService: GeoDataService,
              private bsModalService: BsModalService,
              private projectsService: ProjectsService,
             ) {

  }

  ngOnInit() {
    this.environment = environment;
    this.geoDataService.overlays.subscribe((ovs) => {
      this.overlays = ovs;
    });

    this.geoDataService.tileServers.subscribe((tsv) => {
      if (tsv) {
        tsv.forEach(e => {
          e.isDraggable = true;
        });
      }
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

  deleteLayer(tileServerId: number): void {
    this.geoDataService.deleteTileServer(this.activeProject.id, tileServerId);
  }

  toggleLayerActivate(id: number): void {
    this.geoDataService.toggleTileServer(id);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tileServers, event.previousIndex, event.currentIndex);
    let zIndexMax = -(this.tileServers.length);
    this.tileServers.forEach(e => {
      e.zIndex = zIndexMax;
      zIndexMax += 1;
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
    modal.content.onClose.subscribe( (next) => {
    });
  }

  onEnter(value: string, ts: TileServer) {
    value = value.trim();
    if (value && value != ts.name) {
      this.tileServers.map(e => {
        if (e.id == ts.id) {
          e.name = value;
        }
      });
      let newTs = this.tileServers.filter(e => e.id == ts.id);

      // this.geoDataService.updateTileServers(this.activeProject.id, this.tileServers);
      this.geoDataService.updateTileServer(this.activeProject.id, newTs[0]);
    }

    this.hideInput(ts);
  }

  // TODO: Refactor this and make a more abstract component to handle focus/select events
  // This is inefficient
  showInput(newName: string, ts: TileServer, inner: HTMLInputElement) {
    this.inputShown = true;
    ts.showInput = true;
    ts.isDraggable = false;
    this.disableDragging = true;
    setTimeout(() => {
      this.activeInputs.forEach((cools: ElementRef) => {
        if (cools.nativeElement.value == ts.name) {
          cools.nativeElement.focus();
          cools.nativeElement.select();
        }
      });
    }, 1);
  }

  hideInput(ts: TileServer) {
    this.inputShown = false;
    ts.showInput = false;
    ts.isDraggable = true;
    this.disableDragging = false;
  }

  // TODO: Refactor
  setLayerOpacity(id: number, tileOpacity: number) {
    this.tileServers.map(e => {
      if (e.id == id) {
        e.opacity = tileOpacity;
      }
    });
    let ts = this.tileServers.filter(e => e.id == id);
    this.geoDataService.updateTileServer(this.activeProject.id, ts[0]);
  }

  toggleDescription(ts: TileServer) {
    ts.showDescription = true;
  }

  showDescription(ts: TileServer) {
    ts.showDescription = true;
    this.disableDragging = true;
  }

  hideDescription(ts: TileServer) {
    ts.showDescription = false;
    this.disableDragging = false;
  }
}
