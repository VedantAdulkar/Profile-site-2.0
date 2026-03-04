import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
copied = false;
sending = false;
sent = false;
error = false;

constructor(private cdr: ChangeDetectorRef) {}

  async onSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;

    this.sending = true;
    this.sent    = false;
    this.error   = false;
    this.cdr.markForCheck();

    try {
      await emailjs.sendForm(
        'service_ysioysv',    // ← replace with your EmailJS Service ID
        'template_d41joz2',   // ← replace with your EmailJS Template ID
        form,
        'k7nIAxIaFsivcIU2K'     // ← replace with your EmailJS Public Key
      );
      this.sent = true;
      form.reset();
    } catch (err) {
      this.error = true;
      console.error('EmailJS error:', err);
    } finally {
      this.sending = false;
      this.cdr.markForCheck();

      // Auto-clear success/error message after 5 seconds
      setTimeout(() => {
        this.sent  = false;
        this.error = false;
        this.cdr.markForCheck();
      }, 5000);
    }
  }

copyEmail() {
  navigator.clipboard.writeText("vedantadulkar22@gmail.com");
  this.copied = true;

  setTimeout(() => {
    this.copied = false;
  }, 500);
}
}
