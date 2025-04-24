import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecreationalActivitiesComponent } from './recreational-activities.component';

describe('RecreationalActivitiesComponent', () => {
  let component: RecreationalActivitiesComponent;
  let fixture: ComponentFixture<RecreationalActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecreationalActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecreationalActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
