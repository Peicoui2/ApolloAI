import { config } from '../config/env.config.js';
import { serviceAccountCredentials } from '../config/credentials.js';

export class CalendarServiceAccount {
  constructor() {
    this.API_BASE_URL = 'https://www.googleapis.com/calendar/v3';
    this.calendarId = config.GOOGLE_CALENDAR_ID;
    this.accessToken = null;
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    const jwt = await this.createJWT();
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  async createJWT() {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: serviceAccountCredentials.client_email,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaim = btoa(JSON.stringify(claim));
    const base = `${encodedHeader}.${encodedClaim}`;

    const privateKey = serviceAccountCredentials.private_key.replace(/\\n/g, '\n');
    const signature = await this.signJWT(base, privateKey);

    return `${base}.${signature}`;
  }

  async signJWT(base, privateKey) {
    const binaryKey = this.pemToBinary(privateKey);
    const importedKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const encoded = new TextEncoder().encode(base);
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      importedKey,
      encoded
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  pemToBinary(pem) {
    const base64 = pem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  async createEvent(eventDetails) {
    try {
      // Check for conflicts before creating the event
      const hasConflict = await this.hasDateConflict(eventDetails.dateTime);
      
      if (hasConflict) {
        throw new Error('Ya existe una cita programada para esta fecha y hora.');
      }

      const token = await this.getAccessToken();

      const event = {
        summary: `Cita de ${eventDetails.name}`,
        description: `Teléfono: ${eventDetails.phone}\nDetalles adicionales: ${eventDetails.reason || 'No especificados'}`,
        start: {
          dateTime: eventDetails.dateTime.toISOString(),
          timeZone: 'Europe/Madrid'
        },
        end: {
          dateTime: new Date(eventDetails.dateTime.getTime() + config.MEET_DURATION * 60 * 1000).toISOString(),
          timeZone: 'Europe/Madrid'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await fetch(`${this.API_BASE_URL}/calendars/${this.calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async getFutureEvents() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.API_BASE_URL}/calendars/${this.calendarId}/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          timeMin: new Date().toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching future events:', error);
      throw error;
    }
  }

  async hasDateConflict(proposedDateTime) {
    try {
      const futureEvents = await this.getFutureEvents();
      
      // Convert proposed time to start and end times
      const proposedStart = new Date(proposedDateTime);
      const proposedEnd = new Date(proposedDateTime.getTime() + config.MEET_DURATION * 60 * 1000);

      return futureEvents.some(event => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        // Check for overlap
        return (
          (proposedStart >= eventStart && proposedStart < eventEnd) ||
          (proposedEnd > eventStart && proposedEnd <= eventEnd) ||
          (proposedStart <= eventStart && proposedEnd >= eventEnd)
        );
      });
    } catch (error) {
      console.error('Error checking date conflicts:', error);
      throw error;
    }
  }

  parseDateTime(dateString, timeString) {
    if (!dateString || !timeString) return null;
    
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      const [hours, minutes] = timeString.split(':').map(Number);
      
      const date = new Date(year, month - 1, day, hours, minutes);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date time:', error);
      return null;
    }
  }
}