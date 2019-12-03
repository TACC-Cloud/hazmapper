import { Injectable } from '@angular/core';
import {AssetFilters, Project} from '../models/models';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class FilterService {
  private readonly _assetFilter: BehaviorSubject<AssetFilters> = new BehaviorSubject(new AssetFilters);
  public readonly assetFilter: Observable<AssetFilters> = this._assetFilter.asObservable();

  setAssetFilter(val: AssetFilters) {
    this._assetFilter.next(val);
  }

  updateAssetTypes(assetType: string) {
    let updatedAssetFilter = this._assetFilter.getValue();
    updatedAssetFilter.assetType.has(assetType) ? updatedAssetFilter.assetType.delete(assetType) : updatedAssetFilter.assetType.add(assetType);
    this.setAssetFilter(updatedAssetFilter);
  }

  updateBBox(bbox: Array<number>): void {
    let updatedAssetFilter = this._assetFilter.getValue();
    updatedAssetFilter.bbox = bbox;
    this.setAssetFilter(updatedAssetFilter);
  }
}
