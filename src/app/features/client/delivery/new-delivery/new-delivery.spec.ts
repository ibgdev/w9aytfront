import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDelivery } from './new-delivery';

describe('NewDelivery', () => {
  let component: NewDelivery;
  let fixture: ComponentFixture<NewDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDelivery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
