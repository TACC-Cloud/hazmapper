import { Injectable } from '@angular/core';
import {AssetFilters, Project} from '../models/models';
import {BehaviorSubject, Observable} from "rxjs";
import {featureTypes, featureTypeLabels} from '../constants/assets';

@Injectable({
  providedIn: 'root'
})

export class FilterService {
  private readonly _assetFilter: BehaviorSubject<AssetFilters> = new BehaviorSubject(new AssetFilters(featureTypes.join(',')));
  public readonly assetFilter: Observable<AssetFilters> = this._assetFilter.asObservable();

  private _enabledAssetTypes: BehaviorSubject<Array<string>> = new BehaviorSubject([...featureTypes]);
  public enabledAssetTypes: Observable<Array<string>> = this._enabledAssetTypes.asObservable();

  setAssetFilter(val: AssetFilters) {
    this._assetFilter.next(val);
  }

  updateAssetTypes() {
    const flatAssetTypes = this._enabledAssetTypes.getValue().join(',');
    let updatedAssetFilter = this._assetFilter.getValue();
    updatedAssetFilter.assetType = updatedAssetFilter.assetType === flatAssetTypes ? "" : flatAssetTypes;
    this.setAssetFilter(updatedAssetFilter);
  }

  updateEnabledAssetTypes(assetType: string) {
    let enabledAssetTypes = this._enabledAssetTypes.getValue();

    if (enabledAssetTypes.includes(assetType)) {
      this._enabledAssetTypes.next(enabledAssetTypes.filter(at => at !== assetType));
    } else {
      this._enabledAssetTypes.next([...enabledAssetTypes, assetType]);
    }
    this.updateAssetTypes();
  }

  updateBBox(bbox: Array<number>): void {
    let updatedAssetFilter = this._assetFilter.getValue();
    updatedAssetFilter.bbox = bbox;
    this.setAssetFilter(updatedAssetFilter);
  }
}
