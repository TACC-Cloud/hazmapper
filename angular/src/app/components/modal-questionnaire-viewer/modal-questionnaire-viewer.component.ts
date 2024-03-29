import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-foundation/modal/bs-modal-ref.service';
import { Feature } from '../../models/models';
import { ProjectsService } from 'src/app/services/projects.service';
import { QuestionnaireBuilder } from '../../utils/questionnaireBuilder';
import { GeoDataService } from '../../services/geo-data.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-modal-questionnaire-viewer',
  templateUrl: './modal-questionnaire-viewer.component.html',
  styleUrls: ['./modal-questionnaire-viewer.component.styl'],
})
export class ModalQuestionnaireViewerComponent implements OnInit {
  @Input() feature: Feature;

  constructor(private modalRef: BsModalRef, private geoDataService: GeoDataService, private projectService: ProjectsService) {}

  ngOnInit() {
    this.projectService.activeProject.subscribe((p) => {
      this.geoDataService.getFeatureAssetSource(this.feature, '/questionnaire.rq').subscribe((featureSource: any) => {
        const asset_path = this.geoDataService.getFeatureAssetSourcePath(this.feature);
        const questionnaire = QuestionnaireBuilder.renderQuestionnaire(featureSource, asset_path);
        $('#questionnaire-view').after(questionnaire); // Insert new elements after <img>
      });
    });
  }

  cancel() {
    this.modalRef.hide();
  }
}
