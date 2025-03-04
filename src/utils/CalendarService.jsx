export class CalendarService {
    constructor() {
        this.API_BASE_URL = 'https://www.googleapis.com/calendar/v3';
    }

    parseDateTime(dateString, timeString) {
        if (!dateString || !timeString) {
            console.error('Missing date or time string');
            return null;
        }

        try {
            console.log("|" + dateString + "|", "|" + timeString + "|");
            const [day, month, year] = dateString.split("/").map(Number);
            const [hours, minutes] = timeString.split(":").map(Number);

            if (day == null || month == null || year == null || hours == null || minutes == null) {
                throw new Error('Invalid date or time format');
            }

            const date = new Date(year, month - 1, day, hours, minutes);

            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }

            return date;
        } catch (error) {
            console.error("Error parsing date and time:", error);
            return null;
        }
    }

    async createCalendarEvent(session, eventDetails) {
        console.log(session.provider_token, "-> session.provider_token");

        if (!session.provider_token) {
            throw new Error('No authentication token available');
        }

        try {
            console.log("Creating calendar event with details:", eventDetails);
            const event = {
                'summary': `Cita de ${eventDetails.name}`,
                'description': `Teléfono: ${eventDetails.phone}\nDetalles adicionales: ${eventDetails.reason || 'No especificados'}`,
                'start': {
                    'dateTime': eventDetails.dateTime.toISOString(),
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'end': {
                    'dateTime': new Date(eventDetails.dateTime.getTime() + 60 * 60 * 1000).toISOString(), // Add 1 hour
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60}, // 24 hours email reminder
                        {'method': 'popup', 'minutes': 30} // 30 minutes popup reminder
                    ]
                }
            };
            console.log(event, "-> event");

            const response = await fetch(`${this.API_BASE_URL}/calendars/primary/events`, {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer '+session.provider_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create event');
            }

            const data = await response.json();
            console.log("Event created successfully:", data);
            return data;
        } catch (error) {
            console.error("Error creating calendar event:", error);
            throw error;
        }
    }

    /**
     * Obtiene los eventos del calendario
     */
    async getEvents() {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: 10,
                orderBy: 'startTime'
            });

            console.log('Events retrieved:', response.data.items);
            return response.data.items;
        } catch (error) {
            console.error('Error retrieving events:', error);
            throw error;
        }
    }

    /**
     * Actualiza un evento existente
     */
    async updateEvent(eventId, eventDetails) {
        try {
            const event = {
                summary: `Cita de ${eventDetails.name}`,
                description: eventDetails.reason || 'Cita programada',
                start: {
                    dateTime: eventDetails.dateTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: new Date(eventDetails.dateTime.getTime() + 60 * 60 * 1000).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            const response = await this.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
            });

            console.log('Event updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    /**
     * Elimina un evento
     */
    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });

            console.log('Event deleted');
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
}