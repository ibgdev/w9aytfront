import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCompany } from './gestion-company.component';

describe('GestionCompany', () => {
  let component: GestionCompany;
  let fixture: ComponentFixture<GestionCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
