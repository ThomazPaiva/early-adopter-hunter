export type SignalStatus = 'Novo' | 'Observando' | 'Oportunidade' | 'Descartado';

export interface Signal {
  id: number;
  title: string;
  context?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  tags: string[];
  status: SignalStatus;
  createdAt: string;
}

// payload enviado para criar/editar (sem id/createdAt, quem gera é o backend)
export interface SignalInput {
  title: string;
  context?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  tags: string[];
  status: SignalStatus;
}
