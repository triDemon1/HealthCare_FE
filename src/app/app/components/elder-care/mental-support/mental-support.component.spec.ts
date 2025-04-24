import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentalSupportComponent } from './mental-support.component';

describe('MentalSupportComponent', () => {
  let component: MentalSupportComponent;
  let fixture: ComponentFixture<MentalSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentalSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentalSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
