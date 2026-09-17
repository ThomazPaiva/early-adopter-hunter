export type SignalStatus = 'New' | 'Watching' | 'Opportunity' | 'Discarded';

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

// payload sent to create/edit (no id/createdAt, the backend generates those)
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
