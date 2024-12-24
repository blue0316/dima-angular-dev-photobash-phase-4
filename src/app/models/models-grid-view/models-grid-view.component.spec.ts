import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsGridViewComponent } from './models-grid-view.component';

describe('ModelsGridViewComponent', () => {
  let component: ModelsGridViewComponent;
  let fixture: ComponentFixture<ModelsGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
