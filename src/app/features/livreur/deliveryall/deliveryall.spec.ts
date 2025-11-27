import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Deliveryall } from './deliveryall';

describe('Deliveryall', () => {
  let component: Deliveryall;
  let fixture: ComponentFixture<Deliveryall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Deliveryall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deliveryall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
