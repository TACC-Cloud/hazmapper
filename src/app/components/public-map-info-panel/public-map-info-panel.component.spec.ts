import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicMapInfoPanelComponent } from './public-map-info-panel.component';

describe('PublicMapInfoPanelComponent', () => {
  let component: PublicMapInfoPanelComponent;
  let fixture: ComponentFixture<PublicMapInfoPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicMapInfoPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicMapInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
