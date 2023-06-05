import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewRef,
} from '@angular/core';
import { PathTree } from '../../models/path-tree';
import { Feature } from '../../models/models';
import { GeoDataService } from '../../services/geo-data.service';
import { Observable, Subscription } from 'rxjs';
import { StreetviewService } from 'src/app/services/streetview.service';

@Component({
  selector: 'app-file-tree-node',
  templateUrl: './file-tree-node.component.html',
  styleUrls: ['./file-tree-node.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTreeNodeComponent implements OnInit, OnDestroy {
  @Input() isPublicView = false;
  @Input() node: PathTree<Feature>;
  @Output() clickEvent: EventEmitter<PathTree<Feature>> = new EventEmitter<PathTree<Feature>>();
  public activeFeature: Feature;
  public activeStreetviewAsset: any;
  private activeFeatureSub: Subscription;
  private activeStreetviewAssetSub: Subscription;
  public displayChildren = true;

  constructor(private geoDataService: GeoDataService, private streetviewService: StreetviewService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.activeFeatureSub = this.geoDataService.activeFeature.subscribe((next) => {
      this.activeFeature = next;
      // NOTE: This is important for the change detection to get triggered. Without this and OnPush,
      // angular freaks out because of the recursions
      if (!(this.cdRef as ViewRef).destroyed) {
        this.cdRef.detectChanges();
      }
    });

    this.activeStreetviewAssetSub = this.streetviewService.activeAsset.subscribe((next) => {
      this.activeStreetviewAsset = next;
      // NOTE: This is important for the change detection to get triggered. Without this and OnPush,
      // angular freaks out because of the recursions
      if (!(this.cdRef as ViewRef).destroyed) {
        this.cdRef.detectChanges();
      }
    });

    this.geoDataService.featureTree$.subscribe((next) => {
      // NOTE: This is important for the change detection to get triggered. Without this and OnPush,
      // angular freaks out because of the recursions
      if (!(this.cdRef as ViewRef).destroyed) {
        this.cdRef.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.activeFeatureSub.unsubscribe();
    this.activeStreetviewAssetSub.unsubscribe();
  }

  isActiveFeature() {
    const feature = this.node.getPayload();
    const activeFeature =
      feature && feature.featureType() === 'streetview'
        ? this.activeStreetviewAsset
          ? this.activeStreetviewAsset.feature
          : null
        : this.activeFeature;
    return feature && activeFeature && activeFeature.id === feature.id;
  }

  onClick(node: PathTree<Feature>) {
    if (node.isDir()) {
      this.displayChildren = !this.displayChildren;
    } else {
      this.clickEvent.emit(node);
    }
  }

  onClickChild(item: PathTree<Feature>) {
    this.clickEvent.emit(item);
  }

  delete(item: PathTree<Feature>) {
    this.geoDataService.deleteFeature(item.getPayload());
  }
}
