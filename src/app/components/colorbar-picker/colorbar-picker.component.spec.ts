import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorbarPickerComponent } from './colorbar-picker.component';

describe('ColorbarPickerComponent', () => {
  let component: ColorbarPickerComponent;
  let fixture: ComponentFixture<ColorbarPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorbarPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorbarPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
