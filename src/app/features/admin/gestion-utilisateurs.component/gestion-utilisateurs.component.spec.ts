import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionUtilisateurs } from './gestion-utilisateurs.component';

describe('GestionUtilisateursComponent', () => {
  let component: GestionUtilisateurs;
  let fixture: ComponentFixture<GestionUtilisateurs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionUtilisateurs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionUtilisateurs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
