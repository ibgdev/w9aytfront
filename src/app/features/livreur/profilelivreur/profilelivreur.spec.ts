import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileLivreurComponent } from './profilelivreur';
import { SidebarComponent } from '../sidebar/sidebar';

describe('ProfileLivreurComponent', () => {
  let component: ProfileLivreurComponent;
  let fixture: ComponentFixture<ProfileLivreurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileLivreurComponent, SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileLivreurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
