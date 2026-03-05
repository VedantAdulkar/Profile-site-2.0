import { Component, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aboutme',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aboutme1.html',
  styleUrl: './aboutme1.scss',
})
export class Aboutme1 implements AfterViewInit {
  activeTab = 'skills';
  mobileFlipped = false;

  constructor(private cdr: ChangeDetectorRef) {}

  opentab(tab: string) { this.activeTab = tab; }

  toggleMobileFlip() {
    this.mobileFlipped = !this.mobileFlipped;
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    const els = document.querySelectorAll('#about .reveal-left, #about .reveal-right');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(el => obs.observe(el));
  }
}
