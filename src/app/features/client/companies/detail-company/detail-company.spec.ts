import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCompany } from './detail-company';

describe('DetailCompany', () => {
  let component: DetailCompany;
  let fixture: ComponentFixture<DetailCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
