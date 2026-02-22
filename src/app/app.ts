import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Startup } from './components/startup';
import { Dashboard } from './components/dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, Startup, Dashboard],
  template: `
    @if (showStartup()) {
      <app-startup (complete)="onStartupComplete()"></app-startup>
    } @else {
      <app-dashboard></app-dashboard>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class App {
  showStartup = signal(true);

  onStartupComplete() {
    this.showStartup.set(false);
  }
}
