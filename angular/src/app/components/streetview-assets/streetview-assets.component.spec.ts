import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewAssetsComponent } from './streetview-assets.component';

describe('StreetviewAssetsComponent', () => {
  let component: StreetviewAssetsComponent;
  let fixture: ComponentFixture<StreetviewAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
