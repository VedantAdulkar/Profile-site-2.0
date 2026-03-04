// navbar.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-logo">
        <span class="logo-v">V</span>edant.
      </div>
      <ul class="nav-links">
        <li><a href="#home"     class="nav-link">HOME</a></li>
        <li><a href="#aboutme"  class="nav-link">About</a></li>
        <li><a href="#projects" class="nav-link">Projects</a></li>
        <li><a href="#contact"  class="nav-link">Contact</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;           /* ← locked to top always */
      top: 0;
      left: 0;
      right: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 2.5rem;

      /* Blurry transparent background */
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      transition: background 0.3s ease;
    }

    /* Logo */
    .nav-logo {
      font-family: 'Poppins', sans-serif;
      font-size: 1.45rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      cursor: default;
    }

    .logo-v {
      color: #e8000d;
    }

    /* Nav links */
    .nav-links {
      list-style: none;
      display: flex;
      gap: 2.8rem;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      letter-spacing: 0.08em;
      position: relative;
      transition: color 0.25s ease;

      /* Underline slide-in on hover */
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: #03b3c3;
        transition: width 0.3s cubic-bezier(0.77, 0, 0.18, 1);
      }

      &:hover {
        color: #fff;

        &::after {
          width: 100%;
        }
      }
    }
  `],
})
export class Navbar {}