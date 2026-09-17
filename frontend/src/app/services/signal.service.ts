import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Signal, SignalInput } from '../models/signal';

@Injectable({ providedIn: 'root' })
export class SignalService {
  // in dev, proxy.conf.json redirects /api to the .NET backend (localhost:5199)
  private readonly baseUrl = '/api/signals';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Signal[]> {
    return this.http.get<Signal[]>(this.baseUrl);
  }

  create(input: SignalInput): Observable<Signal> {
    return this.http.post<Signal>(this.baseUrl, input);
  }

  update(id: number, input: SignalInput): Observable<Signal> {
    return this.http.put<Signal>(`${this.baseUrl}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
