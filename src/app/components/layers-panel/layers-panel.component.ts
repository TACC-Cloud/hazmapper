import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
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
  @ViewChild('activeText', {static: false}) activeInput: ElementRef<HTMLInputElement>;  

  basemap: string;
  overlays: Array<Overlay>;
  tileServers: Array<TileServer>;
  environment: AppEnvironment;
  activeProject: Project;
  dragging: TileServer;
  draggedOver: TileServer;
  inputShown: boolean = false;  

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

  deleteLayer(tileServerId: number): void {
    this.geoDataService.deleteTileServer(this.activeProject.id, tileServerId);
  }

  toggleLayerActivate(id: number): void {
    this.geoDataService.toggleTileServer(id);
  }

  // TODO (for setDragElement, setDragOverElement, dropEleemnt): change name to tileserver related things
  setDragElement(id: number): void {
    this.dragging = this.tileServers.filter(ts => ts.id == id)[0];
  }

  setDragOverElement(e: any, id: number): void {
    e.preventDefault();
    this.draggedOver = this.tileServers.filter(ts => ts.id == id)[0];
  }

  dropElement() {
    let index1 = this.tileServers.indexOf(this.dragging);
    let index2 = this.tileServers.indexOf(this.draggedOver);
    this.dragging.zIndex = index2;
    this.draggedOver.zIndex = index1;
    this.tileServers.splice(index1, 1)
    this.tileServers.splice(index2, 0, this.dragging)
    this.geoDataService.updateTileServers(this.activeProject.id, this.tileServers);
    
    // this.geoDataService.updateTileServer(this.activeProject.id, ts[0]);
    // this.geoDataService.updateTileServer(this.activeProject.id, ts[0]);
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
  
  onEnter(value: string, ts: TileServer) {
    value = value.trim();
    if (value && value != ts.name) {
      // this.nameChange = value;
      this.tileServers.map(e => {
        if (e.id == ts.id) {
          e.name = value;
        }
      });
      let newTs = this.tileServers.filter(e => e.id == ts.id);

      // this.geoDataService.updateTileServers(this.activeProject.id, this.tileServers);
      this.geoDataService.updateTileServer(this.activeProject.id, newTs[0]);      
    }

    this.hideInput();
  }

  showInput(newName: string) {
    this.inputShown = true;
    setTimeout(() => {
      this.activeInput.nativeElement.value = newName;
      this.activeInput.nativeElement.focus()
      this.activeInput.nativeElement.select()
    }, 1);
  }

  hideInput() {
    this.inputShown = false;
  }  
  

  // TODO: Refactor
  setLayerOpacity(id: number, tileOpacity: number) {
    this.tileServers.map(e => {
      if (e.id == id) {
        e.opacity = tileOpacity;
      }
    });
    let ts = this.tileServers.filter(e => e.id == id);

    // this.geoDataService.updateTileServers(this.activeProject.id, this.tileServers);
    this.geoDataService.updateTileServer(this.activeProject.id, ts[0]);
  }
}
