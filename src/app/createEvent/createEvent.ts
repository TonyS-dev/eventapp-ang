import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService, Event, Venue } from '../service/event.service';
import { ToastComponent } from '../shared/toast.component';

@Component({
  selector: 'app-event',
  imports: [FormsModule, CommonModule, ToastComponent],
  templateUrl: './createEvent.html',
  styleUrl: './createEvent.css',
})
export class CreateEventComponent {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  name: string = "";
  location: string = "";
  date: string = "";
  description: string = "";
  venueId: number | undefined;
  events: Event[] = [];
  venues: Venue[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  constructor(private readonly eventService: EventService) {
    this.loadEvents();
    this.loadVenues();
  }

  loadVenues() {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('📥 Loading venues...');
    this.eventService.getVenues().subscribe({
      next: (data) => {
        console.log('✅ Venues loaded:', data);
        this.venues = data;
        this.isLoading = false;
        this.toast?.success('Venues loaded successfully');
      },
      error: (err) => {
        console.error('❌ Error loading venues:', err);
        const errorMsg = this.formatError(err);
        this.errorMessage = errorMsg;
        this.toast?.error(errorMsg);
        console.log('💬 Error message set to:', this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('📥 Loading events...');
    this.eventService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Events loaded:', data);
        this.events = data;
        this.isLoading = false;
        this.toast?.success('Events loaded successfully');
      },
      error: (err) => {
        console.error('❌ Error loading events:', err);
        const errorMsg = this.formatError(err);
        this.errorMessage = errorMsg;
        this.toast?.error(errorMsg);
        console.log('💬 Error message set to:', this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  addEvent() {
    // Clear previous field errors
    this.fieldErrors = {};

    // Validate required fields
    const missingFields: string[] = [];
    if (!this.name || this.name.trim() === '') {
      this.fieldErrors['name'] = 'Name is required';
      missingFields.push('Name');
    }
    if (!this.location || this.location.trim() === '') {
      this.fieldErrors['location'] = 'Location is required';
      missingFields.push('Location');
    }
    if (!this.date || this.date.trim() === '') {
      this.fieldErrors['date'] = 'Date is required';
      missingFields.push('Date');
    }

    // If there are missing fields, show error and stop
    if (missingFields.length > 0) {
      const errorMsg = `Please fill in the following required fields:\n• ${missingFields.join('\n• ')}`;
      this.toast?.warning(errorMsg);
      console.warn('⚠️ Form incomplete:', missingFields);
      return;
    }

    if (this.name && this.location && this.date) {
      this.isLoading = true;
      this.errorMessage = '';
      console.log('➕ Creating event...');
      this.eventService.create({
        name: this.name,
        location: this.location,
        date: this.date,
        description: this.description,
        venueId: this.venueId
      }).subscribe({
        next: (event) => {
          console.log('✅ Event created:', event);
          this.events.push(event);
          this.toast?.success(`Event "${event.name}" created successfully!`);
          // Reset form
          this.name = "";
          this.location = "";
          this.date = "";
          this.description = "";
          this.venueId = undefined;
          this.fieldErrors = {};
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Error creating event:', err);
          const errorMsg = this.formatError(err);
          this.errorMessage = errorMsg;
          this.toast?.error(errorMsg);

          // Map backend field errors to form fields
          if (err?.error?.errors && Array.isArray(err.error.errors)) {
            for (const e of err.error.errors) {
              this.fieldErrors[e.field] = e.message;
            }
          }

          console.log('💬 Error message set to:', this.errorMessage);
          this.isLoading = false;
        }
      });
    }
  }

  deleteEvent(id: number | undefined) {
    if (id) {
      this.eventService.delete(id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== id);
          this.toast?.success('Event deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting event:', err);
          const errorMsg = this.formatError(err);
          this.errorMessage = errorMsg;
          this.toast?.error(errorMsg);
        }
      });
    }
  }

  private formatError(err: any): string {
    console.log('🔍 Formatting error:', err);
    console.log('🔍 err.error:', err?.error);

    // RFC7807 style with validation errors array: { type, title, status, detail, errors: [{field, message, rejectedValue}] }
    if (err?.error?.type) {
      let msg = `${err.error.title || 'Error'}: ${err.error.detail || ''}`;

      // If there are field-level validation errors, add them
      if (err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
        const fieldErrors = err.error.errors
          .map((e: any) => `• ${e.field}: ${e.message}`)
          .join('\n');
        msg = `${err.error.title || 'Validation Error'}\n${fieldErrors}`;
      }

      console.log('📋 RFC7807 error formatted:', msg);
      return msg;
    }
    // ApiResponse style: { status: 'error', message }
    if (err?.error?.message) {
      console.log('📋 ApiResponse error formatted:', err.error.message);
      return err.error.message;
    }
    // Generic fallback
    const msg = `HTTP ${err?.status ?? 'unknown'}: ${err?.statusText ?? err?.message ?? 'An error occurred'}`;
    console.log('📋 Generic error formatted:', msg);
    return msg;
  }

}
