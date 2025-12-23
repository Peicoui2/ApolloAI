import { supabase } from '../main';

export class AppointmentService {
    async createAppointment(appointmentDetails, userId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([
                    {
                        user_id: userId,
                        name: appointmentDetails.name,
                        phone: appointmentDetails.phone,
                        date_time: appointmentDetails.dateTime,
                        reason: appointmentDetails.reason || 'No reason provided',
                    }
                ])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving appointment:', error);
            throw error;
        }
    }

    async getUserAppointments(userId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', userId)
                .order('date_time', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    async deleteAppointment(appointmentId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', appointmentId);
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
}