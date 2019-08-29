import { TestBed } from '@angular/core/testing';

import { AgaveFilesService } from './agave-files.service';

describe('AgaveFilesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgaveFilesService = TestBed.get(AgaveFilesService);
    expect(service).toBeTruthy();
  });
});
