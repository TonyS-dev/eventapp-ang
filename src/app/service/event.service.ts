import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Event model matching backend EventResponse
export interface Event {
  id?: number;
  name: string;
  location: string;
  date: string; // ISO date string
  description?: string;
  venue?: {
    id?: number;
    name?: string;
    address?: string;
    capacity?: number;
  };
}

// Event creation/update request
export interface EventRequest {
  name: string;
  location: string;
  date: string;
  description?: string;
  venueId?: number;
}

// Venue model returned by backend
export interface Venue {
  id: number;
  name: string;
  address?: string;
  capacity?: number;
}

// API response wrapper (if your backend uses ApiResponse)
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Base API URL for events backend
  private readonly apiUrl = 'http://localhost:8080/api/events';

  constructor(private readonly http: HttpClient) { }

  // Get all events
  getAll(): Observable<Event[]> {
    return this.http.get<{ data: Event[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // Get a single event by ID
  getById(id: number): Observable<Event> {
    return this.http.get<{ data: Event }>(`${this.apiUrl}/${id}`).pipe(
      map(r => r.data)
    );
  }

  // Create a new event
  create(event: EventRequest): Observable<Event> {
    return this.http.post<{ data: Event }>(this.apiUrl, event).pipe(
      map(r => r.data)
    );
  }

  // Update an existing event
  update(id: number, event: EventRequest): Observable<Event> {
    return this.http.put<{ data: Event }>(`${this.apiUrl}/${id}`, event).pipe(
      map(r => r.data)
    );
  }

  // Delete an event
  delete(id: number): Observable<void> {
    // backend may return an ApiResponse; ignore payload and expose void
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  // Get all venues
  getVenues(): Observable<Venue[]> {
    // assume backend exposes /api/venues and wraps responses in { data: [...] }
    return this.http.get<{ data: Venue[] }>('http://localhost:8080/api/venues').pipe(
      map(r => r.data)
    );
  }

  // Simple ping to check backend availability. Tries /actuator/health then falls back to /api/events
  ping(): Observable<{ ok: boolean; message?: string }> {
    const healthUrl = 'http://localhost:8080/actuator/health';
    return this.http.get<any>(healthUrl).pipe(
      map(() => ({ ok: true })),
    );
  }
}
