import {Component, Input, OnInit} from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Feature } from '../../models/models';
import {QuestionnaireAsset} from '../../models/questionnaire';

@Component({
  selector: 'app-questionnaire-detail',
  templateUrl: './questionnaire-detail.component.html',
  styleUrls: ['./questionnaire-detail.component.styl'],
  providers: [NgbCarouselConfig]
})
export class QuestionnaireDetailComponent implements OnInit {
  @Input() feature: Feature;
  @Input() featureSource: string;
  assetImages: Array<QuestionnaireAsset>;

  constructor(config: NgbCarouselConfig) {
    config.showNavigationArrows = true;
    config.showNavigationIndicators = true;
  }

  ngOnInit() {
    // Retrieve asset images and map them to a new array with proper paths to full/preview images
    this.assetImages = this.feature.properties._hazmapper.questionnaire.assets.map((asset) => {
      const pathToFullImage = this.featureSource + '/' + asset.filename;
      const fileExtension = pathToFullImage.substring(pathToFullImage.lastIndexOf('.'));
      const pathWithoutExtension = pathToFullImage.substring(0, pathToFullImage.lastIndexOf('.'));
      const pathToPreviewImage = `${pathWithoutExtension}.preview${fileExtension}`;

      const filename = asset.filename.split('.');
      filename.splice(filename.length - 1, 0, 'preview');
      return {
        filename: asset.filename,
        coordinates: asset.coordinates,
        path: pathToFullImage,
        previewPath: pathToPreviewImage
      };
    });
  }

}
