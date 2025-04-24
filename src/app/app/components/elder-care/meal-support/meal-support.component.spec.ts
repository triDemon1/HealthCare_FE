import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealSupportComponent } from './meal-support.component';

describe('MealSupportComponent', () => {
  let component: MealSupportComponent;
  let fixture: ComponentFixture<MealSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
