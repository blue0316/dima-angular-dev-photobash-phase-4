import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitsGridDetailsComponent } from './kits-grid-details.component';

describe('KitsGridDetailsComponent', () => {
  let component: KitsGridDetailsComponent;
  let fixture: ComponentFixture<KitsGridDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitsGridDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitsGridDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
