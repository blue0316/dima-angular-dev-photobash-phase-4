import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsGridFilterComponent } from './models-grid-filter.component';

describe('ModelsGridFilterComponent', () => {
  let component: ModelsGridFilterComponent;
  let fixture: ComponentFixture<ModelsGridFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsGridFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsGridFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
