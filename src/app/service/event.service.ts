import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Event model matching backend EventResponse
export interface EventData {
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
export interface VenueData {
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
  private readonly apiUrl = 'https://eventhub-nx.onrender.com/api/events';

  constructor(private readonly http: HttpClient) { }

  // Get all events
  getAll(): Observable<EventData[]> {
    return this.http.get<{ data: EventData[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // Get a single event by ID
  getById(id: number): Observable<EventData> {
    return this.http.get<{ data: EventData }>(`${this.apiUrl}/${id}`).pipe(
      map(r => r.data)
    );
  }

  // Create a new event
  create(event: EventRequest): Observable<EventData> {
    return this.http.post<{ data: EventData }>(this.apiUrl, event).pipe(
      map(r => r.data)
    );
  }

  // Update an existing event
  update(id: number, event: EventRequest): Observable<EventData> {
    return this.http.put<{ data: EventData }>(`${this.apiUrl}/${id}`, event).pipe(
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
  getVenues(): Observable<VenueData[]> {
    // assume backend exposes /api/venues and wraps responses in { data: [...] }
    return this.http.get<{ data: VenueData[] }>('https://eventhub-nx.onrender.com/api/venues').pipe(
      map(r => r.data)
    );
  }

  // Simple ping to check backend availability using /api/events
  ping(): Observable<{ ok: boolean; message?: string }> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(() => ({
        ok: true,
        message: 'Backend reachable'
      })),
    );
  }
}
