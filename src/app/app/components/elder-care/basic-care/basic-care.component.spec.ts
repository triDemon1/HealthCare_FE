import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCareComponent } from './basic-care.component';

describe('BasicCareComponent', () => {
  let component: BasicCareComponent;
  let fixture: ComponentFixture<BasicCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicCareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
