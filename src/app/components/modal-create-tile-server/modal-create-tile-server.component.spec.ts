import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateTileServerComponent } from './modal-create-tile-server.component';

describe('ModalCreateTileServerComponent', () => {
  let component: ModalCreateTileServerComponent;
  let fixture: ComponentFixture<ModalCreateTileServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCreateTileServerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateTileServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
