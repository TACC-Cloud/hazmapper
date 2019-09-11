import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateProjectComponent } from './modal-create-project.component';
import {GeoDataService} from '../../services/geo-data.service';
import {instance, mock} from 'ts-mockito';
import {AuthService} from '../../services/authentication.service';
import {BsModalRef, ModalModule} from 'ngx-foundation';
import {ProjectsService} from '../../services/projects.service';
import {ReactiveFormsModule} from '@angular/forms';

describe('ModalCreateProjectComponent', () => {
  let component: ModalCreateProjectComponent;
  let fixture: ComponentFixture<ModalCreateProjectComponent>;
  const MockModal: BsModalRef = mock(BsModalRef);
  const MockProjects: ProjectsService = mock(ProjectsService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateProjectComponent ],
      imports: [ReactiveFormsModule, ModalModule],
      providers: [
        {
          provide: ProjectsService, useFactory: () => instance(MockProjects)
        },
        {
          provide: BsModalRef, useFactory: () => instance(MockModal)
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
