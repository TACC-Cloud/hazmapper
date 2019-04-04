import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsPanelComponent } from './assets-panel.component';

describe('AssetsPanelComponent', () => {
  let component: AssetsPanelComponent;
  let fixture: ComponentFixture<AssetsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
