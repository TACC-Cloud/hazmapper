import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Feature } from '../../models/models';
import { QuestionnaireBuilder } from '../../utils/questionnaireBuilder';
import * as $ from 'jquery';

@Component({
  selector: 'app-modal-questionnaire-viewer',
  templateUrl: './modal-questionnaire-viewer.component.html',
  styleUrls: ['./modal-questionnaire-viewer.component.styl'],
})
export class ModalQuestionnaireViewerComponent implements OnInit {
  @Input() feature: Feature;

  constructor(private modalRef: BsModalRef) {}

  ngOnInit() {
    const questionnaire = QuestionnaireBuilder.renderQuestionnaire(
      this.feature.properties
    );
    $('#questionnaire-view').after(questionnaire); // Insert new elements after <img>
  }

  cancel() {
    this.modalRef.hide();
  }
}
