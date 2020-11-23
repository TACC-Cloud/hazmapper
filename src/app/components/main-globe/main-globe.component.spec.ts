import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGlobeComponent } from './main-globe.component';

describe('MainGlobeComponent', () => {
  let component: MainGlobeComponent;
  let fixture: ComponentFixture<MainGlobeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainGlobeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainGlobeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
