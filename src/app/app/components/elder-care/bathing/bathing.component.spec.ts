import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BathingComponent } from './bathing.component';

describe('BathingComponent', () => {
  let component: BathingComponent;
  let fixture: ComponentFixture<BathingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BathingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BathingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
