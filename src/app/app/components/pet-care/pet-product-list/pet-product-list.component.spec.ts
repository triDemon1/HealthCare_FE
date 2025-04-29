import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetProductListComponent } from './pet-product-list.component';

describe('PetProductListComponent', () => {
  let component: PetProductListComponent;
  let fixture: ComponentFixture<PetProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetProductListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
