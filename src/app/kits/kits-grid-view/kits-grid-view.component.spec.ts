import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitsGridViewComponent } from './kits-grid-view.component';

describe('KitsGridViewComponent', () => {
  let component: KitsGridViewComponent;
  let fixture: ComponentFixture<KitsGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitsGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitsGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
