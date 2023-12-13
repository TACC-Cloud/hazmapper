import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalQuestionnaireViewerComponent } from './modal-questionnaire-viewer.component';

describe('ModalQuestionnaireViewerComponent', () => {
  let component: ModalQuestionnaireViewerComponent;
  let fixture: ComponentFixture<ModalQuestionnaireViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalQuestionnaireViewerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalQuestionnaireViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
