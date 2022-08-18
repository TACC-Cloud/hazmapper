import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewAssetDetailComponent } from './streetview-asset-detail.component';

describe('StreetviewAssetDetailComponent', () => {
  let component: StreetviewAssetDetailComponent;
  let fixture: ComponentFixture<StreetviewAssetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreetviewAssetDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewAssetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
