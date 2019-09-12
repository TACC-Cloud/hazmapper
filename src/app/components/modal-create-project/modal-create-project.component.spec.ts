import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateProjectComponent } from './modal-create-project.component';
import {anything, instance, mock, reset, spy, when} from 'ts-mockito';
import {BsModalRef, ModalModule} from 'ngx-foundation';
import {ProjectsService} from '../../services/projects.service';
import {ReactiveFormsModule} from '@angular/forms';
import {featureFixture} from '../../fixtures/feature.fixture';
import {Test} from 'tslint';

class MockModal {
  hide() {}
}

describe('ModalCreateProjectComponent', () => {
  let component: ModalCreateProjectComponent;
  let fixture: ComponentFixture<ModalCreateProjectComponent>;
  const MockProjects: ProjectsService = mock(ProjectsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateProjectComponent ],
      imports: [ReactiveFormsModule, ModalModule],
      providers: [
        {
          provide: ProjectsService, useFactory: () => instance(MockProjects)
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
    reset(MockProjects);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call submit on cancel', () => {
    const modals = TestBed.get(BsModalRef);
    spyOn(modals, 'hide').and.returnValue('');
    const spySubmit = spyOn(component, 'submit');
    fixture.detectChanges();
    component.close();
    expect(spySubmit).not.toHaveBeenCalled();
  });
});
