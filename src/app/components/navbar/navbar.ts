import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  menuOpen = false;
  scrolled = false;

  constructor(private cdr: ChangeDetectorRef) {}

  reloadPage() {
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.location.reload();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.cdr.markForCheck();
  }

  goToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth'
  });
}
}
