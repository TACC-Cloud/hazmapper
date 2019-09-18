import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFileBrowserComponent } from './modal-file-browser.component';

describe('ModalFileBrowserComponent', () => {
  let component: ModalFileBrowserComponent;
  let fixture: ComponentFixture<ModalFileBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFileBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFileBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
