import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitsGridFilterComponent } from './kits-grid-filter.component';

describe('KitsGridFilterComponent', () => {
  let component: KitsGridFilterComponent;
  let fixture: ComponentFixture<KitsGridFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitsGridFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitsGridFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
