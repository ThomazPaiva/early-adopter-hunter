import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal, SignalInput, SignalStatus } from './models/signal';
import { SignalService } from './services/signal.service';

type FilterOption = 'Todos' | SignalStatus;

const EMPTY_FORM: SignalInput = {
  title: '',
  context: '',
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  tags: [],
  status: 'Novo',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // Estado como signals: no modo zoneless (padrão do Angular 22), é o
  // signal.set()/update() que dispara a atualização da tela — inclusive
  // quando a mudança vem de uma resposta assíncrona da API, fora de um
  // evento de clique.
  signalsList = signal<Signal[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  filters: FilterOption[] = ['Todos', 'Novo', 'Observando', 'Oportunidade', 'Descartado'];
  currentFilter = signal<FilterOption>('Todos');

  statusOptions: SignalStatus[] = ['Novo', 'Observando', 'Oportunidade', 'Descartado'];

  drawerOpen = signal(false);
  editingId = signal<number | null>(null);
  tagsInput = signal('');

  // O formulário em si é mutado apenas dentro de handlers de clique/ngModel,
  // que já disparam detecção de mudança no Angular — não precisa ser signal.
  form: SignalInput = { ...EMPTY_FORM };

  toastMessage = signal('');
  toastVisible = signal(false);

  filteredSignals = computed(() => {
    const filter = this.currentFilter();
    const all = this.signalsList();
    return filter === 'Todos' ? all : all.filter((s) => s.status === filter);
  });

  totalCount = computed(() => this.signalsList().length);
  observandoCount = computed(() => this.signalsList().filter((s) => s.status === 'Observando').length);
  oportunidadeCount = computed(() => this.signalsList().filter((s) => s.status === 'Oportunidade').length);

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
        this.errorMessage.set('Não consegui falar com a API. Ela está rodando em localhost:5199?');
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
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
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
      this.showToast('Dá um título pro sinal antes de salvar');
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
        this.showToast('Sinal salvo');
        this.drawerOpen.set(false);
        this.editingId.set(null);
        this.loadSignals();
      },
      error: () => this.showToast('Não foi possível salvar. Tenta de novo.'),
    });
  }

  deleteCurrent(): void {
    const id = this.editingId();
    if (id === null) return;
    this.signalService.delete(id).subscribe({
      next: () => {
        this.showToast('Sinal excluído');
        this.drawerOpen.set(false);
        this.editingId.set(null);
        this.loadSignals();
      },
      error: () => this.showToast('Não foi possível excluir.'),
    });
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2200);
  }
}
