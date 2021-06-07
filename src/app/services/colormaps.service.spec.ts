import { TestBed } from '@angular/core/testing';

import { ColormapsService } from './colormaps.service';

describe('ColormapsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColormapsService = TestBed.get(ColormapsService);
    expect(service).toBeTruthy();
  });
});
