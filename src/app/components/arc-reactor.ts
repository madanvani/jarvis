import { Component, ElementRef, AfterViewInit, inject, input, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { animate } from "motion";

@Component({
  selector: 'app-arc-reactor',
  template: `
    <div class="relative flex items-center justify-center w-80 h-80">
      <!-- Background Glow -->
      <div class="absolute inset-0 bg-orange-600/5 rounded-full blur-3xl animate-pulse"></div>

      <!-- Outer Decorative Ring -->
      <div class="absolute w-full h-full border-[1px] border-orange-500/20 rounded-full"></div>
      
      <!-- Main Rotating Ring (Orange) -->
      <div #ring1 class="absolute w-[95%] h-[95%] border-[12px] border-orange-600/40 rounded-full border-t-transparent border-b-transparent shadow-[0_0_30px_rgba(234,88,12,0.3)]"></div>
      
      <!-- Inner Segmented Ring -->
      <div #ring2 class="absolute w-[80%] h-[80%] border-[4px] border-dashed border-orange-400/60 rounded-full"></div>
      
      <!-- Counter-Rotating Ring (Teal accent) -->
      <div #ring3 class="absolute w-[70%] h-[70%] border-[2px] border-teal-500/40 rounded-full border-l-transparent border-r-transparent"></div>
      
      <!-- Core Housing -->
      <div class="absolute w-[50%] h-[50%] border-[1px] border-orange-500/30 rounded-full flex items-center justify-center">
        <!-- Inner Core -->
        <div class="relative w-24 h-24 bg-orange-600/10 rounded-full flex items-center justify-center border border-orange-500/40 shadow-[0_0_50px_rgba(234,88,12,0.4)] overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-tr from-orange-600/20 to-red-600/20 animate-pulse"></div>
          <div class="z-10 text-orange-100 font-mono text-[12px] tracking-[0.2em] uppercase font-bold">F.R.I.D.A.Y</div>
        </div>
      </div>

      <!-- Pulse Effect when listening -->
      @if (isListening()) {
        <div class="absolute inset-0 rounded-full border-8 border-orange-500 animate-ping opacity-10"></div>
        <div class="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulse opacity-30"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ArcReactor implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  isListening = input<boolean>(false);

  @ViewChild('ring1') ring1El!: ElementRef;
  @ViewChild('ring2') ring2El!: ElementRef;
  @ViewChild('ring3') ring3El!: ElementRef;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.ring1El) animate(this.ring1El.nativeElement, { rotate: 360 }, { duration: 20, repeat: Infinity, ease: "linear" });
    if (this.ring2El) animate(this.ring2El.nativeElement, { rotate: -360 }, { duration: 30, repeat: Infinity, ease: "linear" });
    if (this.ring3El) animate(this.ring3El.nativeElement, { rotate: 360 }, { duration: 10, repeat: Infinity, ease: "linear" });
  }
}
