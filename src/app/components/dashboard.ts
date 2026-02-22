import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { JarvisService } from '../services/jarvis';
import { ArcReactor } from './arc-reactor';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, ArcReactor],
  template: `
    <div class="min-h-screen bg-[#0a0502] text-orange-400 font-sans selection:bg-orange-500/30 overflow-hidden relative">
      <!-- Background Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <!-- HUD Overlay -->
      <div class="relative z-10 p-4 h-screen flex flex-col">
        
        <!-- Top Bar: System Info & Quick Actions -->
        <div class="flex justify-between items-center mb-4 border-b border-orange-500/20 pb-2">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 border border-orange-500/40 rounded flex items-center justify-center bg-orange-500/5">
              <mat-icon class="text-orange-500">security</mat-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold tracking-widest text-white uppercase">S.H.I.E.L.D OS v6.0</span>
              <span class="text-[8px] font-mono text-orange-500/60">Ver 2026.02.21 // Madan's Personal HUD</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button (click)="jarvis.startListening()" class="px-3 py-1 border border-orange-500/40 bg-orange-500/10 rounded text-[8px] font-mono uppercase hover:bg-orange-500/30 cursor-pointer transition-all">
              [ Sync Neural Link ]
            </button>
            <button (click)="dailyBriefing()" class="px-3 py-1 border border-orange-500/40 bg-orange-500/10 rounded text-[8px] font-mono uppercase hover:bg-orange-500/30 cursor-pointer transition-all animate-pulse">
              [ Daily Briefing ]
            </button>
            @for (app of ['Neural Link', 'Quantum Grid', 'Satellite Uplink']; track app) {
              <div class="px-3 py-1 border border-orange-500/20 bg-orange-500/5 rounded text-[8px] font-mono uppercase hover:bg-orange-500/20 cursor-pointer transition-colors">
                {{ app }}
              </div>
            }
          </div>

          <div class="flex items-center gap-4">
            <div class="flex flex-col items-end">
              <span class="text-xl font-mono text-white leading-none">{{ currentTime }}</span>
              <span class="text-[8px] font-mono text-orange-500/60 uppercase tracking-widest">{{ currentDate }}</span>
            </div>
            <div class="w-10 h-10 border border-orange-500/40 rounded flex items-center justify-center bg-orange-500/5">
              <span class="text-lg font-bold text-white">26</span>
            </div>
          </div>
        </div>

        <!-- Main HUD Body -->
        <div class="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
          
          <!-- Left Sidebar: App Shortcuts -->
          <div class="col-span-1 flex flex-col gap-2 py-4">
            @for (item of shortcuts; track item.name) {
              <button (click)="launch(item.action)" class="group flex flex-col items-center justify-center p-2 border border-orange-500/10 bg-orange-500/5 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all rounded relative">
                <mat-icon class="text-lg mb-1">{{ item.icon }}</mat-icon>
                <span class="text-[7px] font-mono uppercase tracking-tighter">{{ item.name }}</span>
                <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            }
          </div>

          <!-- Main Center Area -->
          <div class="col-span-8 relative flex flex-col">
            <!-- Central Arc Reactor -->
            <div class="flex-1 flex items-center justify-center relative">
              <app-arc-reactor [isListening]="jarvis.isListening()"></app-arc-reactor>
              
              <!-- Floating Data Points around Reactor -->
              <div class="absolute top-1/4 left-1/4 text-[8px] font-mono text-orange-500/40">
                UNLIMITED<br>FILELIST<br>LASTTORRENTS
              </div>
              <div class="absolute bottom-1/4 right-1/4 text-[8px] font-mono text-orange-500/40 text-right">
                Used: 2.9 GB [RAM]<br>Free: 1.0 GB
              </div>
            </div>

            <!-- Voice Controls & Transcript -->
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl text-center">
              @if (jarvis.isListening()) {
                <div class="text-orange-400 animate-pulse font-mono text-sm mb-2 tracking-widest uppercase">Listening...</div>
              } @else if (jarvis.isProcessing()) {
                <div class="text-red-400 animate-bounce font-mono text-sm mb-2 tracking-widest uppercase">Processing...</div>
              }
              
              @if (jarvis.transcript()) {
                <div class="px-6 py-3 bg-black/60 backdrop-blur-md border border-orange-500/20 rounded-lg font-mono text-xs text-orange-100 shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                  <span class="opacity-40 mr-2">>></span> {{ jarvis.transcript() }}
                </div>
              }
            </div>
          </div>

          <!-- Right Sidebar: Widgets & Stats -->
          <div class="col-span-3 flex flex-col gap-4 py-4 overflow-y-auto custom-scrollbar">
            <!-- Weather Widget -->
            <div class="hud-card p-4 border border-orange-500/20 bg-orange-500/5 rounded">
              <div class="flex justify-between items-start mb-2">
                <div class="flex flex-col">
                  <span class="text-[8px] font-mono text-orange-500/60 uppercase">Hyderabad, IN</span>
                  <span class="text-2xl font-bold text-white">24°C</span>
                </div>
                <mat-icon class="text-orange-500">wb_sunny</mat-icon>
              </div>
              <div class="text-[8px] font-mono text-orange-500/80 space-y-1">
                <div>Humidity: 45%</div>
                <div>Visibility: 10.0 km</div>
                <div>Wind: 12 km/h [S]</div>
              </div>
            </div>

            <!-- Neural Output (AI Response) -->
            <div class="hud-card p-4 border border-orange-500/20 bg-orange-500/5 rounded flex-1 flex flex-col min-h-[200px]">
              <div class="flex items-center gap-2 mb-2 border-b border-orange-500/10 pb-1">
                <mat-icon class="text-xs">memory</mat-icon>
                <span class="text-[8px] font-mono uppercase tracking-widest">Neural Output</span>
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <p class="text-[10px] leading-relaxed text-orange-100/90 font-mono italic">
                  {{ jarvis.lastResponse() || 'Awaiting input sequence, Madan. Systems are at peak efficiency.' }}
                </p>
              </div>
            </div>

            <!-- System Gauges (Simulated) -->
            <div class="hud-card p-4 border border-orange-500/20 bg-orange-500/5 rounded">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[8px] font-mono uppercase">Core Load</span>
                <span class="text-[8px] font-mono">{{ cpuLoads[0] }}%</span>
              </div>
              <div class="w-full h-[2px] bg-orange-900/30 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 transition-all duration-500" [style.width.%]="cpuLoads[0]"></div>
              </div>
              
              <div class="mt-4 flex justify-between items-center">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 rounded-full border-2 border-orange-500/20 flex items-center justify-center relative">
                    <div class="absolute inset-0 border-2 border-orange-500 rounded-full border-t-transparent transition-all duration-500" [style.transform]="'rotate(' + (cpuLoads[1] * 3.6) + 'deg)'"></div>
                    <span class="text-[8px] font-mono">{{ cpuLoads[1] }}%</span>
                  </div>
                  <span class="text-[6px] font-mono mt-1 uppercase">RAM</span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 rounded-full border-2 border-orange-500/20 flex items-center justify-center relative">
                    <div class="absolute inset-0 border-2 border-red-500 rounded-full border-t-transparent transition-all duration-500" [style.transform]="'rotate(' + (cpuLoads[2] * 3.6) + 'deg)'"></div>
                    <span class="text-[8px] font-mono">{{ cpuLoads[2] }}%</span>
                  </div>
                  <span class="text-[6px] font-mono mt-1 uppercase">GPU</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Bar: Status & Connection -->
        <div class="mt-4 pt-2 border-t border-orange-500/20 flex justify-between items-center text-[8px] font-mono text-orange-500/40">
          <div class="flex gap-4">
            <span class="flex items-center gap-1"><div class="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div> WIFI: 76%</span>
            <span>BATTERY: 100% [AC LINE]</span>
            <span>UPTIME: 0d 18h 27m</span>
          </div>
          <div class="flex gap-4">
            <span>LOC: 17.3850° N, 78.4867° E</span>
            <span class="text-orange-500/80">SECURE CONNECTION: ESTABLISHED</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hud-card {
      backdrop-filter: blur(4px);
      box-shadow: inset 0 0 15px rgba(234,88,12,0.03);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(234,88,12,0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(234,88,12,0.3);
    }
  `]
})
export class Dashboard implements OnInit, OnDestroy {
  jarvis = inject(JarvisService);
  private platformId = inject(PLATFORM_ID);
  
  currentTime = '';
  currentDate = '';
  cpuLoads = [45, 32, 67, 21];
  private timer: ReturnType<typeof setInterval> | undefined;

  shortcuts = [
    { name: 'Firefox', icon: 'language', action: 'google' },
    { name: 'Explorer', icon: 'folder', action: 'google' },
    { name: 'iTunes', icon: 'music_note', action: 'youtube' },
    { name: 'Facebook', icon: 'facebook', action: 'google' },
    { name: 'Twitter', icon: 'alternate_email', action: 'google' },
    { name: 'Gmail', icon: 'mail', action: 'gmail' },
    { name: 'WhatsApp', icon: 'chat', action: 'whatsapp' }
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateTime();
      this.timer = setInterval(() => {
        this.updateTime();
        this.cpuLoads = this.cpuLoads.map(l => Math.min(100, Math.max(0, Math.round(l + (Math.random() * 10 - 5)))));
      }, 1000);

      // Auto-start listening after dashboard loads
      setTimeout(() => this.jarvis.startListening(), 2000);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (isPlatformBrowser(this.platformId)) {
      this.jarvis.stopListening();
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  launch(app: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    switch(app) {
      case 'google': window.open('https://google.com', '_blank'); break;
      case 'youtube': window.open('https://youtube.com', '_blank'); break;
      case 'whatsapp': window.open('https://web.whatsapp.com', '_blank'); break;
      case 'gmail': window.open('https://mail.google.com', '_blank'); break;
    }
  }

  dailyBriefing() {
    this.jarvis.processCommand("Give me a daily briefing for February 21, 2026. Include top news and weather summary for Hyderabad.");
  }
}
