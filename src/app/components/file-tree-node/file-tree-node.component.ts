import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output, ViewRef
} from '@angular/core';
import {PathTree} from '../../models/path-tree';
import {Feature} from '../../models/models';
import {GeoDataService} from '../../services/geo-data.service';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-file-tree-node',
  templateUrl: './file-tree-node.component.html',
  styleUrls: ['./file-tree-node.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class FileTreeNodeComponent implements OnInit, OnDestroy {

  @Input() node: PathTree<Feature>;
  @Output() clickEvent: EventEmitter<PathTree<Feature>> = new EventEmitter<PathTree<Feature>>();
  public activeFeature: Feature;
  private activeFeatureSub: Subscription;
  public displayChildren = true;

  constructor(private geoDataService: GeoDataService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.activeFeatureSub = this.geoDataService.activeFeature.subscribe( (next) => {
      this.activeFeature = next;
      // NOTE: This is important for the change detection to get triggered. Without this and OnPush,
      // angular freaks out because of the recursions
      if (!(this.cdRef as ViewRef).destroyed) {
        this.cdRef.detectChanges();
      }
    });
    this.geoDataService.featureTree$.subscribe( (next) => {
      // NOTE: This is important for the change detection to get triggered. Without this and OnPush,
      // angular freaks out because of the recursions
      if (!(this.cdRef as ViewRef).destroyed) {
        this.cdRef.detectChanges();
      }
    });

  }

  ngOnDestroy() {
      this.activeFeatureSub.unsubscribe();
  }

  isActiveFeature() {
    return this.node.getPayload() !== null && this.activeFeature !== null && this.activeFeature.id === this.node.getPayload().id;
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
