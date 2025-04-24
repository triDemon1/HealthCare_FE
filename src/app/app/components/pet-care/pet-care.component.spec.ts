import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetCareComponent } from './pet-care.component';

describe('PetCareComponent', () => {
  let component: PetCareComponent;
  let fixture: ComponentFixture<PetCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetCareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
