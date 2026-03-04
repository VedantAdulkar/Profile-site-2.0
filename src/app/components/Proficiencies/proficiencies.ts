// proficiencies.ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tech { name: string; icon: string; }

@Component({
  selector: 'app-proficiencies',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="prof-section">

      <div class="prof-heading">
        <span class="prof-line left"></span>
        <h2>My Proficiencies</h2>
        <span class="prof-line right"></span>
      </div>

      <div class="marquee-outer" #marqueeOuter
           (mouseenter)="pause()" (mouseleave)="resume()">
        <div class="marquee-track" [class.paused]="isPaused">

          <div class="marquee-inner">
            <div class="tech-card" *ngFor="let t of techs"
                 (mouseenter)="onHover($event, t)"
                 (mouseleave)="onLeave()"
                 [class.active]="hovered === t"
                 [style.--glow]="hovered === t ? glowColor : 'rgba(255,255,255,0.07)'">
              <div class="card-circle">
                <img [src]="t.icon" [alt]="t.name" draggable="false"/>
              </div>
              <span class="card-label" [class.show]="hovered === t">{{ t.name }}</span>
            </div>
          </div>

          <div class="marquee-inner" aria-hidden="true">
            <div class="tech-card" *ngFor="let t of techs"
                 (mouseenter)="onHover($event, t)"
                 (mouseleave)="onLeave()"
                 [class.active]="hovered === t"
                 [style.--glow]="hovered === t ? glowColor : 'rgba(255,255,255,0.07)'">
              <div class="card-circle">
                <img [src]="t.icon" [alt]="t.name" draggable="false"/>
              </div>
              <span class="card-label" [class.show]="hovered === t">{{ t.name }}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .prof-section {
      background: #000;
      padding: 5rem 0 0 0;
      overflow: hidden;
    }

    .prof-heading {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      justify-content: center;
      margin-bottom: 3rem;
      padding: 0 2rem;
    }
    .prof-heading h2 {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(1.4rem, 3vw, 2rem);
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      letter-spacing: 0.06em;
    }
    .prof-line { flex: 1; height: 1px; max-width: 180px; }
    .prof-line.left  { background: linear-gradient(to right, transparent, #6750a2); }
    .prof-line.right { background: linear-gradient(to left,  transparent, #03b3c3); }

    .marquee-outer {
      width: 100%;
      overflow-x: auto;
      padding: 1rem 0 2.5rem;
      mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
      scrollbar-width: none;  
      &::-webkit-scrollbar { display: none; }
    }

    .marquee-track {
      display: flex;
      width: max-content;
      animation: scroll 45s linear infinite;
      align-items: flex-end;
    }
    .marquee-track.paused { animation-play-state: paused; }

    @keyframes scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    .marquee-inner {
      display: flex;
      align-items: flex-end;
      gap: 1.8rem;
      padding: 0.5rem 0.9rem;
    }

    /* ── Card ── */
    .tech-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: default;
      flex-shrink: 0;
    }

    /* ── Circle default ── */
    .card-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #0d0d0d;
      border: 1.5px solid rgba(255, 255, 255, 0.07);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition:
        width        0.4s cubic-bezier(0.34, 1.46, 0.64, 1),
        height       0.4s cubic-bezier(0.34, 1.46, 0.64, 1),
        border-color 0.3s ease,
        box-shadow   0.3s ease;

      img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        user-select: none;
        pointer-events: none;
        transition: width 0.4s ease, height 0.4s ease;
      }
    }

    /* ── Hover/active: expand in place ── */
    .tech-card.active .card-circle {
      width: 120px;
      height: 120px;
      border-color: var(--glow);
      box-shadow:
        0 0 18px var(--glow),
        0 0 48px color-mix(in srgb, var(--glow) 30%, transparent),
        inset 0 0 22px color-mix(in srgb, var(--glow) 10%, transparent);

      img {
        width: 64px;
        height: 64px;
      }
    }

    /* ── Label ── */
    .card-label {
      font-family: 'Poppins', sans-serif;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
      text-align: center;
      color: var(--glow);
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transform: translateY(-5px);
      transition:
        opacity    0.25s ease 0.18s,
        transform  0.25s ease 0.18s,
        max-height 0.25s ease 0.18s;
      pointer-events: none;
    }

    .card-label.show {
      opacity: 1;
      max-height: 2rem;
      transform: translateY(0);
    }
  `],
})
export class ProficienciesComponent implements AfterViewInit, OnDestroy {

  @ViewChild('marqueeOuter') marqueeOuterRef!: ElementRef<HTMLElement>;

  isPaused = false;
  hovered: Tech | null = null;
  glowColor = '#03b3c3';

  private resizeObs!: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.resizeObs = new ResizeObserver(() => {});
      this.resizeObs.observe(this.marqueeOuterRef.nativeElement);
    });
  }

  ngOnDestroy() { this.resizeObs?.disconnect(); }

  pause()  { this.isPaused = true;  this.cdr.markForCheck(); }
  resume() { this.isPaused = false; this.cdr.markForCheck(); }

  onHover(event: MouseEvent, tech: Tech) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const vw   = window.innerWidth;

    // Left third → purple, middle → magenta, right → cyan
    if      (cx < vw * 0.33) this.glowColor = '#6750a2';
    else if (cx < vw * 0.66) this.glowColor = '#c247ac';
    else                      this.glowColor = '#03b3c3';

    this.hovered = tech;
    this.cdr.markForCheck();
  }

  onLeave() {
    this.hovered = null;
    this.cdr.markForCheck();
  }

  techs: Tech[] = [
    { name: 'Python',           icon: 'https://img.icons8.com/color/96/python--v1.png' },
    { name: 'SQL',              icon: 'https://img.icons8.com/color/96/sql.png' },
    { name: 'PySpark',          icon: 'https://img.icons8.com/color/96/apache-spark.png' },
    { name: 'Machine Learning', icon: 'https://img.icons8.com/color/96/artificial-intelligence.png' },
    { name: 'AWS',              icon: 'https://img.icons8.com/color/96/amazon-web-services.png' },
    { name: 'Database',         icon: 'https://img.icons8.com/color/96/database.png' },
    { name: 'Neural Network',   icon: 'https://img.icons8.com/pulsar-color/48/artificial-intelligence.png' },
    { name: 'Jupyter',          icon: 'https://img.icons8.com/fluency/48/jupyter.png' },
    { name: 'Power BI',         icon: 'https://img.icons8.com/color/96/power-bi.png' },
    { name: 'PyCharm',          icon: 'https://img.icons8.com/color/96/pycharm.png' },
    { name: 'VS Code',          icon: 'https://img.icons8.com/color/96/visual-studio-code-2019.png' },
    { name: 'Google Colab',     icon: 'https://img.icons8.com/color/96/google-colab.png' },
    { name: 'Flask',            icon: 'https://img.icons8.com/nolan/64/flask.png' },
    { name: 'JDBC',             icon: 'https://img.icons8.com/color/96/java-coffee-cup-logo.png' },
    { name: 'C',                icon: 'https://img.icons8.com/color/96/c-programming.png' },
    { name: 'C++',              icon: 'https://img.icons8.com/color/96/c-plus-plus-logo.png' },
    { name: 'HTML',             icon: 'https://img.icons8.com/color/96/html-5--v1.png' },
    { name: 'CSS',              icon: 'https://img.icons8.com/color/96/css3.png' },
    { name: 'JavaScript',       icon: 'https://img.icons8.com/color/96/javascript--v1.png' },
    { name: 'Java',             icon: 'https://img.icons8.com/color/96/java-coffee-cup-logo.png' },
    { name: 'NLP',              icon: 'https://img.icons8.com/external-outline-black-m-oki-orlando/32/external-natural-artificial-intelligence-outline-black-m-oki-orlando.png' },
    { name: 'RAG',              icon: 'https://img.icons8.com/color/96/knowledge-sharing.png' },
    { name: 'Git',              icon: 'https://img.icons8.com/color/96/git.png' },
    { name: 'GitHub',           icon: 'https://img.icons8.com/color/96/github--v1.png' },
  ];
}