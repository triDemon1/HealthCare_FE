import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicCheckupComponent } from './periodic-checkup.component';

describe('PeriodicCheckupComponent', () => {
  let component: PeriodicCheckupComponent;
  let fixture: ComponentFixture<PeriodicCheckupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicCheckupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodicCheckupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
