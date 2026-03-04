import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fronttab } from './fronttab';

describe('Fronttab', () => {
  let component: Fronttab;
  let fixture: ComponentFixture<Fronttab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fronttab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fronttab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
