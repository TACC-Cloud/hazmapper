import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class ColorMapsService {

  private readonly colormaps: Map<string, (number: number) => number | string>;

  constructor() {
    this.colormaps = new Map<string, (number: number) => (number | string)>();
    this.colormaps.set('brbg', d3.interpolateBrBG);
    this.colormaps.set('prgn', d3.interpolatePRGn);
    this.colormaps.set('piyg', d3.interpolatePiYG);
    this.colormaps.set('puor', d3.interpolatePuOr);
    this.colormaps.set('rdbu', d3.interpolateRdBu);
    this.colormaps.set('rdylgn', d3.interpolateRdYlGn);
    this.colormaps.set('plasma', d3.interpolatePlasma);
    this.colormaps.set('warm', d3.interpolateWarm);
    this.colormaps.set('spectral', d3.interpolateSpectral);
    this.colormaps.set('cool', d3.interpolateCool);
    this.colormaps.set('reds', d3.interpolateReds);
    this.colormaps.set('turbo', d3.interpolateTurbo);

  }

  public getColorMaps(): Map<string, (number: number) => number | string> {
    return this.colormaps;
  }
}
