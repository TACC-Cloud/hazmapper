import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {ColorMapsService} from '../../services/colormaps.service';

@Component({
  selector: 'app-colorbar',
  templateUrl: './colorbar.component.html',
  styleUrls: ['./colorbar.component.styl']
})
export class ColorbarComponent implements AfterViewInit, OnChanges {

  private width = 10;
  private height = 20;
  @Input() colorScale: string;
  private scaler: (t: number) => any;
  @ViewChild('colorbar', {static: false}) container: ElementRef;
  private initialized = false;
  constructor(private colorMapsService: ColorMapsService) { }

  ngAfterViewInit() {
    this.colorScale = this.colorScale == null ? 'brbg' : this.colorScale;
    this.colorScale = this.colorScale.toLocaleLowerCase();
    this.width = this.container.nativeElement.offsetWidth;
    this.scaler = this.colorMapsService.getColorMaps().get(this.colorScale);
    this.initialized = true;
    this.render();
  }

  ngOnChanges() {
    if (this.initialized) {
      this.scaler = this.colorMapsService.getColorMaps().get(this.colorScale);
      this.render();
    }
  }

  private render() {
    console.log(this.colorScale);
    d3.select(this.container.nativeElement).select('svg').remove();
    const svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const colorScale = d3.scaleSequential(this.scaler)
      .domain([0, this.width]);

    const bars = svg.selectAll('.bars')
      .data(d3.range(this.width))
      .enter().append('rect')
      .attr('class', 'bars')
      .attr('x', (d, i) => i)
      .attr('y', 0)
      .attr('height', this.height)
      .attr('width', 1)
      .style('fill', (d, i) =>  colorScale(d));
  }

}
