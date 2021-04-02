import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateProjectComponent } from './modal-create-project.component';
import {instance, mock, reset} from 'ts-mockito';
import {BsModalRef, ModalModule} from 'ngx-foundation';
import {ProjectsService} from '../../services/projects.service';
import {ReactiveFormsModule} from '@angular/forms';
import {projectFixture} from '../../fixtures/project.fixture';

class MockModal {
  hide() {}
}

describe('ModalCreateProjectComponent', () => {
  let component: ModalCreateProjectComponent;
  let fixture: ComponentFixture<ModalCreateProjectComponent>;
  const MockProjectsService: ProjectsService = mock(ProjectsService);


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateProjectComponent ],
      imports: [ReactiveFormsModule, ModalModule],
      providers: [
        {
          provide: ProjectsService, useFactory: () => instance(ProjectsService)
        },
        {
          provide: BsModalRef, useClass: MockModal
        }
      ]
    });

    fixture = TestBed.createComponent(ModalCreateProjectComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    reset(MockProjectsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call submit on cancel', () => {
    const modals = TestBed.get(BsModalRef);
    spyOn(modals, 'hide').and.returnValue('');
    const spySubmit = spyOn(component, 'submit');
    fixture.detectChanges();
    component.close(projectFixture);
    expect(spySubmit).not.toHaveBeenCalled();
  });
});
