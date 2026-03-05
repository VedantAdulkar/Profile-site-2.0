// typing.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="typing-wrapper">
      <span class="typed-text">{{ displayText }}</span>
      <span class="cursor" [class.blink]="isBlinking">|</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline;
    }
    .typing-wrapper {
      display: inline;
    }
    .typed-text {
      display: inline;
      font-family: 'Shalimar-Regular';
      font-size: 70px;
    }
    .cursor {
      display: inline-block;
      font-weight: 300;
      color: #03b3c3;
      margin-left: 1px;
    }
    .cursor.blink {
      animation: blink 0.75s step-end infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `],
})
export class TypingComponent implements OnInit, OnDestroy {

  @Input() text = '';
  @Input() speed = 55;
  @Input() startDelay = 600;

  displayText = '';
  isBlinking = false;

  private index = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.timer = setTimeout(() => this.type(), this.startDelay);
  }

  private type() {
    if (this.index < this.text.length) {
      this.displayText += this.text.charAt(this.index);
      this.index++;
      this.cdr.markForCheck();   // ← tell Angular to re-render
      this.timer = setTimeout(() => this.type(), this.speed);
    } else {
      this.isBlinking = true;
      this.cdr.markForCheck();   // ← update cursor state too
    }
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}