// app.ts
import { CommonModule } from '@angular/common';
import { Component, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { HyperspeedComponent } from './components/fronttab/fronttab';
import { Aboutme } from './components/aboutme/aboutme';
import { TypingComponent } from './components/typing/typing';
import { IntroComponent } from './components/intro/intro';
import { ProficienciesComponent } from './components/Proficiencies/proficiencies';
import { Contact } from './components/contact/contact'
import { Projects } from './components/projects/projects'

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Navbar,
    HyperspeedComponent,
    TypingComponent,
    Aboutme,
    IntroComponent,
    ProficienciesComponent,
    Contact,
    Projects
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('portfolio-site-2');
  siteVisible = false;

  constructor(private cdr: ChangeDetectorRef) {}

  onIntroDone() {
    this.siteVisible = true;
    this.cdr.markForCheck();
  }
}