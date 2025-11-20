import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDemandesComponent } from './validation-demandes.component';

describe('ValidationDemandesComponent', () => {
  let component: ValidationDemandesComponent;
  let fixture: ComponentFixture<ValidationDemandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationDemandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
