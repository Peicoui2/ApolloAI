import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AppointmentService } from '../services/AppointmentService';

export const AppointmentsList = ({ userId }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const appointmentService = new AppointmentService();
        const loadAppointments = async () => {
            try {
                const data = await appointmentService.getUserAppointments(userId);
                setAppointments(data);
            } catch (error) {
                console.error('Error loading appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadAppointments();
        }
    }, [userId]);

    if (loading) return <div>Loading appointments...</div>;

    return (
        <div style={{ margin: '1rem' }}>
            <h3>Your Appointments</h3>
            {appointments.map(apt => (
                <div key={apt.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '1rem',
                    margin: '0.5rem 0',
                    borderRadius: '4px'
                }}>
                    <p><strong>Name:</strong> {apt.name}</p>
                    <p><strong>Date:</strong> {new Date(apt.date_time).toLocaleString()}</p>
                    <p><strong>Phone:</strong> {apt.phone}</p>
                    {apt.reason && <p><strong>Reason:</strong> {apt.reason}</p>}
                </div>
            ))}
            </div>
    );
};

AppointmentsList.propTypes = {
    userId: PropTypes.string.isRequired
};