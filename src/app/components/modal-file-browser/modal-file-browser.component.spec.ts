import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFileBrowserComponent } from './modal-file-browser.component';
import {instance, mock, spy, when} from 'ts-mockito';
import {AuthService} from '../../services/authentication.service';
import {TapisFilesService} from '../../services/tapis-files.service';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import {FileSizeModule} from 'ngx-filesize';
import {userFixture} from '../../fixtures/user.fixture';
import {of} from 'rxjs';
import {BsModalRef} from 'ngx-foundation';

describe('ModalFileBrowserComponent', () => {
  let component: ModalFileBrowserComponent;
  let fixture: ComponentFixture<ModalFileBrowserComponent>;
  const MockAuth: AuthService = mock(AuthService);
  const MockTapisFiles: TapisFilesService = mock(TapisFilesService);
  const MockSystemsService: AgaveSystemsService = mock(AgaveSystemsService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFileBrowserComponent ],
      imports: [FileSizeModule],
      providers: [
        {
          provide: AgaveSystemsService, useFactory: () => instance(MockSystemsService)
        },
        {
          provide: TapisFilesService, useFactory: () => instance(MockTapisFiles)
        },
        {
          provide: AuthService, useFactory: () => instance(MockAuth)
        },
        BsModalRef
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFileBrowserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    when(MockAuth.currentUser).thenReturn(of(userFixture));
    spyOn(MockSystemsService, 'list').and.returnValue(null);
    when(MockSystemsService.projects).thenReturn(of([{name: 'test'}]));
    spyOn(MockTapisFiles, 'listFiles').and.returnValue(null);
    fixture.detectChanges();
    fixture.whenStable().then( () => {
      expect(component).toBeTruthy();
    });
  });
});
