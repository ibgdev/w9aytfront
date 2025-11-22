import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KpiComponent } from './kpi';


describe('KpiComponent', () => {
  let component: KpiComponent;
  let fixture: ComponentFixture<KpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
