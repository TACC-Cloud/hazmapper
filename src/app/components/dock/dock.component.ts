import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.styl']
})
export class DockComponent implements OnInit {

  showAssetsPanel;
  showLayersPanel: boolean = false;
  constructor() { }

  ngOnInit() {
    this.showAssetsPanel = false;
    this.showLayersPanel = false;
  }

}
