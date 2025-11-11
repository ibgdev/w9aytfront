import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySignup } from './company-signup';

describe('CompanySignup', () => {
  let component: CompanySignup;
  let fixture: ComponentFixture<CompanySignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
