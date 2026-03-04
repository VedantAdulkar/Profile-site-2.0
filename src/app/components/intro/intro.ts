// intro.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="intro-overlay" [class.hidden]="isDone">

      <!-- The logo in the center, then morphs to top-left -->
      <div class="logo-wrap" [class.move-to-corner]="moveToCorner">
        <span class="logo-v">V</span><span class="logo-rest" [class.reveal]="revealRest">edant.</span>
      </div>

    </div>
  `,
  styles: [`
    /* ── Overlay covers entire screen ── */
    .intro-overlay {
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: all;
      transition: opacity 0.8s ease, visibility 0.8s ease;
    }

    .intro-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    /* ── Logo centered by default ── */
    .logo-wrap {
      position: fixed;
      display: flex;
      align-items: center;

      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      color: #fff;
      letter-spacing: -0.02em;

      /* Start: centered */
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      transition:
        top    0.7s cubic-bezier(0.77, 0, 0.18, 1),
        left   0.7s cubic-bezier(0.77, 0, 0.18, 1),
        transform 0.7s cubic-bezier(0.77, 0, 0.18, 1),
        font-size 0.7s cubic-bezier(0.77, 0, 0.18, 1);
    }

    /* ── Morphed: top-left (matches your navbar position) ── */
    .logo-wrap.move-to-corner {
      top: 0.65rem;
      left: 4.8rem;
      transform: translate(0, 0);
      font-size: clamp(2.5rem, 2vw, 1.6rem);
    }

    /* ── Red V ── */
    .logo-v {
      color: #e8000d;
      display: inline-block;

      /* Clip reveal: left → right */
      clip-path: inset(0 100% 0 0);
      animation: revealLeft 0.6s cubic-bezier(0.77, 0, 0.18, 1) 0.3s forwards;
    }

    @keyframes revealLeft {
      to { clip-path: inset(0 0% 0 0); }
    }

    /* ── "edant." reveals after V ── */
    .logo-rest {
      display: inline-block;
      clip-path: inset(0 100% 0 0);
      transition: clip-path 0.5s cubic-bezier(0.77, 0, 0.18, 1);
    }

    .logo-rest.reveal {
      clip-path: inset(0 0% 0 0);
    }
  `],
})
export class IntroComponent implements OnInit {

  /** Fires when the intro is fully done — parent fades in the site */
  @Output() done = new EventEmitter<void>();

  revealRest   = false;
  moveToCorner = false;
  isDone       = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Step 1 — 0.3s: "V" starts revealing (via CSS animation)
    // Step 2 — 1.1s: "edant." reveals left→right
    setTimeout(() => {
      this.revealRest = true;
      this.cdr.markForCheck();
    }, 1100);

    // Step 3 — 2.2s: logo morphs to top-left corner
    setTimeout(() => {
      this.moveToCorner = true;
      this.cdr.markForCheck();
    }, 2200);

    // Step 4 — 3.1s: overlay fades out, site fades in
    setTimeout(() => {
      this.isDone = true;
      this.cdr.markForCheck();
      // Give fade-out time to complete before removing
      setTimeout(() => this.done.emit(), 0);
    }, 3100);
  }
}