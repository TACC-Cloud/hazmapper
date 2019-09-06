import { TestBed } from '@angular/core/testing';

import { TapisFilesService } from './tapis-files.service';

describe('AgaveFilesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TapisFilesService = TestBed.get(TapisFilesService);
    expect(service).toBeTruthy();
  });
});
