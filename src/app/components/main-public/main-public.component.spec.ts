import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPublicComponent } from './main-public.component';

describe('MainPublicComponent', () => {
  let component: MainPublicComponent;
  let fixture: ComponentFixture<MainPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
