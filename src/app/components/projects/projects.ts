// projects.ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bento-section" id="projects">
      <div class="bento-heading">
        <span class="line left"></span>
        <h2>Projects</h2>
        <span class="line right"></span>
      </div>

      <div class="bento-grid" [class.revealed]="revealed">

        <!-- ROW 1: 3 equal small cells -->
        <div class="bento-cell accent-cyan" [class.hovered]="hovered===0" (mouseenter)="hovered=0" (mouseleave)="hovered=null">
          <div class="anim-layer chart-anim">
            <div class="bar" *ngFor="let h of chartBars" [style.height.%]="h"></div>
          </div>
          <div class="cell-num">01</div>
          <div class="corner tl"></div><div class="corner br"></div>
          <div class="cell-body">
            <span class="cell-icon">📊</span>
            <h3>Comment Data Analysis</h3>
            <p>Sentiment intelligence for YouTube comments — classifying emotions and opinions with NLP pipelines at scale.</p>
            <div class="tags"><span class="tag" *ngFor="let t of ['Python','NLP','Sentiment','Analytics']">{{t}}</span></div>
            <span class="cell-link muted">Coming Soon ↗</span>
          </div>
        </div>

        <div class="bento-cell accent-pink" [class.hovered]="hovered===1" (mouseenter)="hovered=1" (mouseleave)="hovered=null">
          <div class="anim-layer pulse-anim">
            <div class="p-ring r1"></div><div class="p-ring r2"></div><div class="p-ring r3"></div>
            <span class="p-icon">🎯</span>
          </div>
          <div class="cell-num">02</div>
          <div class="corner tl"></div><div class="corner br"></div>
          <div class="cell-body">
            <span class="cell-icon">🎯</span>
            <h3>Placement Predictor</h3>
            <p>ML model predicting student placement outcomes and surfacing career success trends from institutional data.</p>
            <div class="tags"><span class="tag" *ngFor="let t of ['Python','ML','Pandas','Scikit-learn']">{{t}}</span></div>
            <a class="cell-link" href="https://github.com/VedantAdulkar/Placement-Predictor" target="_blank" (click)="$event.stopPropagation()">GitHub ↗</a>
          </div>
        </div>

        <div class="bento-cell accent-purple" [class.hovered]="hovered===2" (mouseenter)="hovered=2" (mouseleave)="hovered=null">
          <div class="anim-layer typing-anim">
            <span class="type-text">{{ typingText }}<span class="cur">█</span></span>
          </div>
          <div class="cell-num">03</div>
          <div class="corner tl"></div><div class="corner br"></div>
          <div class="cell-body">
            <span class="cell-icon">🤖</span>
            <h3>Virtual Desktop Assistant</h3>
            <p>Python + OpenAI + Speech API. Listens, understands, and executes your desktop commands hands-free.</p>
            <div class="tags"><span class="tag" *ngFor="let t of ['Python','OpenAI','Speech API','NLP']">{{t}}</span></div>
            <span class="cell-link muted">Coming Soon ↗</span>
          </div>
        </div>

        <!-- ROW 2: large (2 cols) + large (1 col) -->
        <div class="bento-cell cell-large accent-cyan" [class.hovered]="hovered===3" (mouseenter)="hovered=3" (mouseleave)="hovered=null">
          <div class="anim-layer radar-anim">
            <div class="radar-sweep"></div>
            <div class="radar-circle rc1"></div><div class="radar-circle rc2"></div><div class="radar-circle rc3"></div>
            <div class="radar-crosshair h"></div><div class="radar-crosshair v"></div>
            <div class="radar-dot" *ngFor="let d of radarDots" [style.top.%]="d.top" [style.left.%]="d.left" [style.animation-delay]="d.delay+'s'"></div>
          </div>
          <div class="cell-num">04</div>
          <div class="corner tl"></div><div class="corner br"></div>
          <div class="cell-body">
            <span class="cell-icon">🚁</span>
            <h3>Autonomous Drone GCS</h3>
            <p>Ground control system with real-time telemetry, waypoint planning and computer vision-based autonomous navigation system.</p>
            <div class="tags"><span class="tag" *ngFor="let t of ['Python','Computer Vision','Drone','GCS','Sensor Fusion']">{{t}}</span></div>
            <a class="cell-link" href="https://github.com/VedantAdulkar/DroneGCS" target="_blank" (click)="$event.stopPropagation()">GitHub ↗</a>
          </div>
        </div>

        <div class="bento-cell cell-large accent-pink" [class.hovered]="hovered===4" (mouseenter)="hovered=4" (mouseleave)="hovered=null">
          <div class="anim-layer matrix-anim">
            <div class="m-col" *ngFor="let c of matrixCols; let ci=index" [style.animation-delay]="(ci*0.2)+'s'">
              <span *ngFor="let ch of c">{{ch}}</span>
            </div>
          </div>
          <div class="cell-num">05</div>
          <div class="corner tl"></div><div class="corner br"></div>
          <div class="cell-body">
            <span class="cell-icon">📄</span>
            <h3>DocQ — Document Summariser</h3>
            <p>Upload any document, ask anything. RAG pipeline + vector search + LLM reasoning delivers precise contextual answers instantly.</p>
            <div class="tags"><span class="tag" *ngFor="let t of ['Python','RAG','LLM','NLP','Vector DB','Flask']">{{t}}</span></div>
            <a class="cell-link" href="https://github.com/VedantAdulkar/MA_13_DocSummariser" target="_blank" (click)="$event.stopPropagation()">GitHub ↗</a>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    :host { --cyan:#03b3c3; --pink:#d856bf; --purple:#6750a2; }

    .bento-section { background:#000; padding:5rem 2rem 6rem; }

    .bento-heading { display:flex;align-items:center;gap:1rem;justify-content:center;margin-bottom:2.5rem; }
    .bento-heading h2 { font-family:'Poppins',sans-serif;font-size:clamp(1.4rem,3vw,2rem);font-weight:700;color:#fff;white-space:nowrap;letter-spacing:.04em; }
    .line { flex:1;height:1px;max-width:180px; }
    .line.left  { background:linear-gradient(to right,transparent,var(--purple)); }
    .line.right { background:linear-gradient(to left,transparent,var(--cyan)); }

    /* GRID - explicit areas */
    .bento-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 240px 320px;
      gap: 1rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    .bento-cell:nth-child(1) { grid-column: 1; grid-row: 1; }
    .bento-cell:nth-child(2) { grid-column: 2; grid-row: 1; }
    .bento-cell:nth-child(3) { grid-column: 3; grid-row: 1; }
    .bento-cell:nth-child(4) { grid-column: 1 / span 2; grid-row: 2; }
    .bento-cell:nth-child(5) { grid-column: 3; grid-row: 2; }

    /* scroll reveal */
    .bento-cell { opacity:0;transform:translateY(28px) scale(.97);transition:opacity .6s ease,transform .6s ease,border-color .3s,box-shadow .3s; }
    .bento-grid.revealed .bento-cell:nth-child(1){opacity:1;transform:none;transition-delay:0s}
    .bento-grid.revealed .bento-cell:nth-child(2){opacity:1;transform:none;transition-delay:.1s}
    .bento-grid.revealed .bento-cell:nth-child(3){opacity:1;transform:none;transition-delay:.18s}
    .bento-grid.revealed .bento-cell:nth-child(4){opacity:1;transform:none;transition-delay:.26s}
    .bento-grid.revealed .bento-cell:nth-child(5){opacity:1;transform:none;transition-delay:.34s}

    .bento-cell { position:relative;border-radius:1.1rem;background:#090909;border:1px solid rgba(255,255,255,.07);overflow:hidden;cursor:default; }
    .accent-cyan.hovered   { border-color:rgba(3,179,195,.55);  box-shadow:0 0 50px rgba(3,179,195,.15),  inset 0 0 40px rgba(3,179,195,.05); }
    .accent-pink.hovered   { border-color:rgba(216,86,191,.55); box-shadow:0 0 50px rgba(216,86,191,.15), inset 0 0 40px rgba(216,86,191,.05); }
    .accent-purple.hovered { border-color:rgba(103,80,162,.55); box-shadow:0 0 50px rgba(103,80,162,.15), inset 0 0 40px rgba(103,80,162,.05); }

    .corner { position:absolute;width:18px;height:18px;border-style:solid;opacity:0;transition:opacity .3s,width .3s,height .3s;pointer-events:none;z-index:4; }
    .corner.tl { top:10px;left:10px;border-width:2px 0 0 2px;border-radius:3px 0 0 0; }
    .corner.br { bottom:10px;right:10px;border-width:0 2px 2px 0;border-radius:0 0 3px 0; }
    .accent-cyan   .corner { border-color:var(--cyan); }
    .accent-pink   .corner { border-color:var(--pink); }
    .accent-purple .corner { border-color:var(--purple); }
    .bento-cell.hovered .corner { opacity:1;width:28px;height:28px; }

    .cell-num { position:absolute;top:12px;right:16px;font-family:'Courier New',monospace;font-size:3rem;font-weight:900;line-height:1;pointer-events:none;user-select:none;z-index:1;opacity:.06;color:#fff;transition:color .4s,opacity .4s; }
    .bento-cell.hovered .cell-num { opacity:.18; }
    .accent-cyan.hovered   .cell-num { color:var(--cyan); }
    .accent-pink.hovered   .cell-num { color:var(--pink); }
    .accent-purple.hovered .cell-num { color:var(--purple); }

    /* ANIMATION LAYER — high opacity */
    .anim-layer { position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.6;transition:opacity .4s; }
    .bento-cell.hovered .anim-layer { opacity:1; }

    /* CHART */
    .chart-anim { display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:0 1.5rem 3.5rem;position:absolute;bottom:0;left:0;right:0;top:auto;height:80%; }
    .bar { flex:1;max-width:22px;border-radius:5px 5px 0 0;background:linear-gradient(to top,var(--cyan),rgba(3,179,195,.25));box-shadow:0 0 12px rgba(3,179,195,.5);animation:barUp 2.4s ease-in-out infinite alternate;transform-origin:bottom; }
    .bar:nth-child(1){animation-delay:0s}.bar:nth-child(2){animation-delay:.25s}.bar:nth-child(3){animation-delay:.5s}.bar:nth-child(4){animation-delay:.75s}.bar:nth-child(5){animation-delay:1s}.bar:nth-child(6){animation-delay:1.25s}.bar:nth-child(7){animation-delay:1.5s}
    @keyframes barUp { 0%{transform:scaleY(.2)} 100%{transform:scaleY(1)} }

    /* PULSE */
    .pulse-anim { display:flex;align-items:center;justify-content:center; }
    .p-ring { position:absolute;border-radius:50%;border:2px solid var(--pink);box-shadow:0 0 10px var(--pink);animation:pulsate 2.5s ease-out infinite; }
    .r1{width:50px;height:50px;animation-delay:0s}.r2{width:100px;height:100px;animation-delay:.7s}.r3{width:155px;height:155px;animation-delay:1.4s}
    .p-icon { font-size:2rem;position:relative;z-index:1; }
    @keyframes pulsate { 0%{transform:scale(.5);opacity:1} 100%{transform:scale(1.5);opacity:0} }

    /* TYPING */
    .typing-anim { display:flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;font-size:.85rem;color:var(--purple);letter-spacing:.05em;text-shadow:0 0 10px var(--purple); }
    .cur { animation:blinkC .65s step-end infinite;margin-left:2px; }
    @keyframes blinkC { 0%,100%{opacity:1} 50%{opacity:0} }

    /* RADAR */
    .radar-anim { display:flex;align-items:center;justify-content:center; }
    .radar-circle { position:absolute;border-radius:50%;border:1px solid rgba(3,179,195,.35); }
    .rc1{width:80px;height:80px}.rc2{width:160px;height:160px}.rc3{width:260px;height:260px}
    .radar-sweep { position:absolute;width:130px;height:130px;border-radius:50%;background:conic-gradient(from 0deg,transparent 60%,rgba(3,179,195,.2) 80%,rgba(3,179,195,.9) 100%);animation:spin 2.5s linear infinite;box-shadow:0 0 24px rgba(3,179,195,.35); }
    .radar-dot { position:absolute;width:7px;height:7px;border-radius:50%;background:var(--cyan);box-shadow:0 0 12px var(--cyan),0 0 24px var(--cyan);animation:dotPop 3s ease-in-out infinite; }
    .radar-crosshair { position:absolute;background:rgba(3,179,195,.15); }
    .radar-crosshair.h{width:100%;height:1px;top:50%;left:0}.radar-crosshair.v{height:100%;width:1px;left:50%;top:0}
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes dotPop { 0%,100%{opacity:0;transform:scale(0)} 40%,60%{opacity:1;transform:scale(1)} }

    /* MATRIX */
    .matrix-anim { display:flex;gap:12px;justify-content:center;align-items:flex-start;padding:1rem 2rem 0;overflow:hidden; }
    .m-col { display:flex;flex-direction:column;gap:5px;font-family:'Courier New',monospace;font-size:.78rem;color:var(--pink);text-shadow:0 0 8px var(--pink);animation:mFall 2.5s linear infinite; }
    .m-col span { opacity:.7; }
    .m-col span:first-child { opacity:1;color:#fff;font-weight:bold;text-shadow:0 0 12px #fff; }
    @keyframes mFall { 0%{transform:translateY(-120%);opacity:0} 8%{opacity:1} 88%{opacity:.8} 100%{transform:translateY(280px);opacity:0} }

    /* CELL BODY */
    .cell-body { position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;justify-content:flex-end;gap:.4rem;padding:1.4rem 1.5rem;background:linear-gradient(to top,rgba(0,0,0,.95) 35%,rgba(0,0,0,.5) 62%,transparent 100%); }
    .cell-icon { font-size:1.4rem;line-height:1; }
    .cell-body h3 { font-family:'Poppins',sans-serif;font-size:clamp(.9rem,1.3vw,1.05rem);font-weight:700;color:#fff;line-height:1.25;margin:0; }
    .cell-body p { font-family:'Poppins',sans-serif;font-size:.73rem;color:rgba(255,255,255,.55);line-height:1.5;margin:0;max-height:0;overflow:hidden;opacity:0;transition:max-height .4s ease,opacity .35s ease; }
    .bento-cell.hovered .cell-body p { max-height:80px;opacity:1; }
    .tags { display:flex;flex-wrap:wrap;gap:.28rem;max-height:0;overflow:hidden;transition:max-height .35s ease .06s; }
    .bento-cell.hovered .tags { max-height:60px; }
    .tag { font-family:'Poppins',sans-serif;font-size:.58rem;font-weight:500;border-radius:999px;padding:.14rem .5rem;letter-spacing:.04em; }
    .accent-cyan   .tag { color:var(--cyan);  border:1px solid rgba(3,179,195,.4); background:rgba(3,179,195,.1); }
    .accent-pink   .tag { color:var(--pink);  border:1px solid rgba(216,86,191,.4);background:rgba(216,86,191,.1); }
    .accent-purple .tag { color:var(--purple);border:1px solid rgba(103,80,162,.4);background:rgba(103,80,162,.1); }
    .cell-link { font-family:'Poppins',sans-serif;font-size:.72rem;font-weight:600;text-decoration:none;display:inline-block;max-height:0;overflow:hidden;opacity:0;transition:max-height .3s ease .1s,opacity .3s ease .1s; }
    .bento-cell.hovered .cell-link { max-height:28px;opacity:1; }
    .accent-cyan   .cell-link { color:var(--cyan); }
    .accent-pink   .cell-link { color:var(--pink); }
    .accent-purple .cell-link { color:var(--purple); }
    .cell-link.muted { color:rgba(255,255,255,.3);pointer-events:none;cursor:default; }
    .cell-link:not(.muted):hover { text-decoration:underline; }

    @media(max-width:768px){
      .bento-grid { grid-template-columns:1fr 1fr;grid-template-rows:220px 220px 300px 300px; }
      .bento-cell:nth-child(1){grid-column:1;grid-row:1}
      .bento-cell:nth-child(2){grid-column:2;grid-row:1}
      .bento-cell:nth-child(3){grid-column:1/span 2;grid-row:2}
      .bento-cell:nth-child(4){grid-column:1/span 2;grid-row:3}
      .bento-cell:nth-child(5){grid-column:1/span 2;grid-row:4}
    }
    @media(max-width:480px){
      .bento-grid { grid-template-columns:1fr;grid-template-rows:repeat(5,240px); }
      .bento-cell:nth-child(n){grid-column:1}
      .bento-cell:nth-child(1){grid-row:1}.bento-cell:nth-child(2){grid-row:2}.bento-cell:nth-child(3){grid-row:3}.bento-cell:nth-child(4){grid-row:4}.bento-cell:nth-child(5){grid-row:5}
    }
  `],
})
export class Projects implements AfterViewInit, OnDestroy {
  hovered: number | null = null;
  revealed = false;
  chartBars = [38,72,50,88,62,78,45];
  radarDots = [
    {top:35,left:60,delay:0},{top:62,left:35,delay:.9},
    {top:42,left:74,delay:1.7},{top:20,left:50,delay:2.5},{top:70,left:58,delay:1.2}
  ];
  matrixCols = [
    ['R','A','G','0','1','∑','λ'],['L','L','M','∂','∇','β','α'],
    ['V','E','C','T','O','R','S'],['0','1','1','0','1','0','1'],
    ['N','L','P','!','?','∞','Ω'],['D','O','C','Q','↗','■','◆'],
    ['P','Y','T','H','O','N','3'],
  ];
  typingText = '';
  private phrases = ['> listening...','> processing cmd','> opening chrome','> task complete ✓'];
  private pi=0;private ci=0;private tTimer:any;private observer!:IntersectionObserver;

  constructor(private cdr:ChangeDetectorRef,private ngZone:NgZone,private el:ElementRef){}

  ngAfterViewInit(){
    this.ngZone.runOutsideAngular(()=>{
      this.observer=new IntersectionObserver(entries=>{
        if(entries[0].isIntersecting){
          setTimeout(()=>this.ngZone.run(()=>{this.revealed=true;this.cdr.markForCheck();}),80);
          this.observer.disconnect();
        }
      },{threshold:.1});
      this.observer.observe(this.el.nativeElement);
    });
    this.typeNext();
  }
  private typeNext(){
    const p=this.phrases[this.pi];
    if(this.ci<p.length){this.typingText=p.substring(0,++this.ci);this.ngZone.run(()=>this.cdr.markForCheck());this.tTimer=setTimeout(()=>this.typeNext(),80);}
    else{this.tTimer=setTimeout(()=>this.eraseNext(),1000);}
  }
  private eraseNext(){
    if(this.typingText.length>0){this.typingText=this.typingText.slice(0,-1);this.ngZone.run(()=>this.cdr.markForCheck());this.tTimer=setTimeout(()=>this.eraseNext(),35);}
    else{this.pi=(this.pi+1)%this.phrases.length;this.ci=0;this.tTimer=setTimeout(()=>this.typeNext(),300);}
  }
  ngOnDestroy(){clearTimeout(this.tTimer);this.observer?.disconnect();}
}