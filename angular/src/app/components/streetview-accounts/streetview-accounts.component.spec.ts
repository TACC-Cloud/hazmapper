import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewAccountsComponent } from './streetview-accounts.component';

describe('StreetviewAccountsComponent', () => {
  let component: StreetviewAccountsComponent;
  let fixture: ComponentFixture<StreetviewAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
