import { Component } from '@angular/core';

@Component({
  selector: 'app-aboutme',
  imports: [],
  templateUrl: './aboutme.html',
  styleUrl: './aboutme.scss',
})
export class Aboutme {
  activeTab: string = 'skills';  // default tab

  opentab(tabName: string) {
    this.activeTab = tabName;
  }

  ngAfterViewInit() {
    const els = document.querySelectorAll('#about .reveal-left, #about .reveal-right');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 4.15 });
    els.forEach(el => obs.observe(el));
  }
}
