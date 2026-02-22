import { Component, OnInit, output, inject, PLATFORM_ID, ViewChild, ElementRef, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { animate } from "motion";
import { JarvisService } from '../services/jarvis';

@Component({
  selector: 'app-startup',
  template: `
    <div class="fixed inset-0 bg-[#0a0502] z-50 flex flex-col items-center justify-center overflow-hidden">
      <!-- Background Grid (Subtle) -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <!-- FRIDAY Arc Reactor (Startup Version) -->
      <div #logo class="mb-12 opacity-0 scale-90 relative">
        <div class="w-64 h-64 border-[1px] border-orange-500/20 rounded-full flex items-center justify-center relative">
          <div class="absolute inset-0 border-[8px] border-orange-600/30 rounded-full border-t-transparent border-b-transparent animate-[spin_10s_linear_infinite]"></div>
          <div class="absolute inset-4 border-[2px] border-dashed border-orange-400/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          <div class="w-32 h-32 bg-orange-600/5 rounded-full flex items-center justify-center border border-orange-500/30 shadow-[0_0_40px_rgba(234,88,12,0.2)]">
            <span class="text-3xl font-bold text-orange-500 tracking-tighter">F.R.I.D.A.Y</span>
          </div>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="text-orange-400 font-mono text-xs tracking-[0.4em] uppercase h-6 mb-6">
        {{ currentStatus() }}
      </div>

      <!-- Progress Bar (Futuristic) -->
      <div class="w-80 h-[2px] bg-orange-950/30 rounded-full overflow-hidden relative">
        <div #progress class="h-full bg-orange-500 w-0 shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
      </div>
      
      <!-- Decorative HUD elements -->
      <div class="absolute top-10 left-10 text-[8px] font-mono text-orange-500/30 space-y-1">
        <div>S.H.I.E.L.D OS v1.2.0</div>
        <div>UPLINK: ESTABLISHED</div>
        <div>ENCRYPTION: AES-256</div>
      </div>
      <div class="absolute bottom-10 right-10 text-[8px] font-mono text-orange-500/30 text-right space-y-1">
        <div>CORE_TEMP: 34°C</div>
        <div>POWER_CELL: 98%</div>
        <div>STATUS: READY</div>
      </div>
    </div>
  `
})
export class Startup implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private jarvis = inject(JarvisService);
  
  @ViewChild('logo') logoEl!: ElementRef;
  @ViewChild('progress') progressEl!: ElementRef;

  currentStatus = signal('Initializing Systems...');
  isReady = signal(false);
  complete = output<void>();

  private statuses = [
    'Initializing Systems...',
    'Loading Neural Networks...',
    'Calibrating Voice Engine...',
    'Syncing with Satellite...',
    'Systems Online.',
    'Welcome sir.'
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.runSequence();
    } else {
      this.isReady.set(true);
      this.onComplete();
    }
  }

  onComplete() {
    this.complete.emit();
  }

  async runSequence() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Wait for ViewChild to be available
    await new Promise(r => setTimeout(r, 200));

    if (this.logoEl) {
      animate(this.logoEl.nativeElement, { opacity: 1, scale: 1 }, { duration: 2, ease: "easeOut" });
    }

    if (this.progressEl) {
      animate(this.progressEl.nativeElement, { width: '100%' }, { duration: 5, ease: "easeInOut" });
    }

    for (const status of this.statuses) {
      this.currentStatus.set(status);
      await new Promise(r => setTimeout(r, 900));
    }

    this.isReady.set(true);
    
    // Voice greeting - Note: might be blocked by browser without user interaction
    this.jarvis.speak("Welcome sir. Systems are online and at your command.");
    
    // Auto-transition
    setTimeout(() => {
      this.onComplete();
    }, 1500);
  }
}
