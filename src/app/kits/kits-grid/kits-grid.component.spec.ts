import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitsGridComponent } from './kits-grid.component';

describe('KitsGridComponent', () => {
  let component: KitsGridComponent;
  let fixture: ComponentFixture<KitsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
