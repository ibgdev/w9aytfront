import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversationsList } from './conversations-list';

describe('ConversationsList', () => {
  let component: ConversationsList;
  let fixture: ComponentFixture<ConversationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

