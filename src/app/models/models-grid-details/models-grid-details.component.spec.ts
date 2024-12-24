import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsGridDetailsComponent } from './models-grid-details.component';

describe('ModelsGridDetailsComponent', () => {
  let component: ModelsGridDetailsComponent;
  let fixture: ComponentFixture<ModelsGridDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsGridDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsGridDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
