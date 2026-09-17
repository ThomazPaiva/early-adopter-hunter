import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal, SignalInput, SignalStatus } from './models/signal';
import { SignalService } from './services/signal.service';

type FilterOption = 'All' | SignalStatus;

const EMPTY_FORM: SignalInput = {
  title: '',
  context: '',
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  tags: [],
  status: 'New',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // State as signals: in zoneless mode (Angular 22's default), it's
  // signal.set()/update() that triggers the screen update — including
  // when the change comes from an async API response, outside of a
  // click event.
  signalsList = signal<Signal[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  filters: FilterOption[] = ['All', 'New', 'Watching', 'Opportunity', 'Discarded'];
  currentFilter = signal<FilterOption>('All');

  statusOptions: SignalStatus[] = ['New', 'Watching', 'Opportunity', 'Discarded'];

  drawerOpen = signal(false);
  editingId = signal<number | null>(null);
  tagsInput = signal('');

  // The form itself is only mutated inside click/ngModel handlers,
  // which already trigger change detection in Angular — no need to be a signal.
  form: SignalInput = { ...EMPTY_FORM };

  toastMessage = signal('');
  toastVisible = signal(false);

  filteredSignals = computed(() => {
    const filter = this.currentFilter();
    const all = this.signalsList();
    return filter === 'All' ? all : all.filter((s) => s.status === filter);
  });

  totalCount = computed(() => this.signalsList().length);
  watchingCount = computed(() => this.signalsList().filter((s) => s.status === 'Watching').length);
  opportunityCount = computed(() => this.signalsList().filter((s) => s.status === 'Opportunity').length);

  constructor(private signalService: SignalService) {}

  ngOnInit(): void {
    this.loadSignals();
  }

  loadSignals(): void {
    this.loading.set(true);
    this.signalService.getAll().subscribe({
      next: (data) => {
        this.signalsList.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not reach the API. Is it running on localhost:5199?');
        this.loading.set(false);
      },
    });
  }

  setFilter(filter: FilterOption): void {
    this.currentFilter.set(filter);
  }

  statusClass(status: SignalStatus): string {
    return 'status-' + status.toLowerCase();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  openNewDrawer(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.tagsInput.set('');
    this.drawerOpen.set(true);
  }

  openEditDrawer(signal: Signal): void {
    this.editingId.set(signal.id);
    this.form = {
      title: signal.title,
      context: signal.context ?? '',
      q1: signal.q1 ?? '',
      q2: signal.q2 ?? '',
      q3: signal.q3 ?? '',
      q4: signal.q4 ?? '',
      q5: signal.q5 ?? '',
      tags: [...signal.tags],
      status: signal.status,
    };
    this.tagsInput.set(signal.tags.join(', '));
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editingId.set(null);
  }

  setFormStatus(status: SignalStatus): void {
    this.form.status = status;
  }

  save(): void {
    if (!this.form.title.trim()) {
      this.showToast('Give the signal a title before saving');
      return;
    }

    this.form.tags = this.tagsInput()
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const id = this.editingId();
    const request = id ? this.signalService.update(id, this.form) : this.signalService.create(this.form);

    request.subscribe({
      next: () => {
        this.showToast('Signal saved');
        this.drawerOpen.set(false);
        this.editingId.set(null);
        this.loadSignals();
      },
      error: () => this.showToast('Could not save. Try again.'),
    });
  }

  deleteCurrent(): void {
    const id = this.editingId();
    if (id === null) return;
    this.signalService.delete(id).subscribe({
      next: () => {
        this.showToast('Signal deleted');
        this.drawerOpen.set(false);
        this.editingId.set(null);
        this.loadSignals();
      },
      error: () => this.showToast('Could not delete.'),
    });
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2200);
  }
}
