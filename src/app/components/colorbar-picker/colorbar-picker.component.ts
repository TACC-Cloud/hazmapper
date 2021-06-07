import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ColorMapsService} from '../../services/colormaps.service';

@Component({
  selector: 'app-colorbar-picker',
  templateUrl: './colorbar-picker.component.html',
  styleUrls: ['./colorbar-picker.component.styl']
})
export class ColorbarPickerComponent implements OnInit {

  @Output() selection: EventEmitter<string>;
  private colorMaps: Map<string, (number: number) => number | string>;
  private selectedColorMap: string;

  constructor(private colorMapsService: ColorMapsService) { }


  ngOnInit() {
    this.colorMaps = this.colorMapsService.getColorMaps();
  }

  select(colorscheme: string) {
    this.selectedColorMap = colorscheme;
    console.log(colorscheme);
    this.selection.emit(colorscheme);
  }
}
