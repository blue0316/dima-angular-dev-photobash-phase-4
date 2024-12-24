import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageComponentComponent } from './page-component.component';

describe('PageComponentComponent', () => {
  let component: PageComponentComponent;
  let fixture: ComponentFixture<PageComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
