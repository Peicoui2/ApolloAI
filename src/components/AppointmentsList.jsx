import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AppointmentService } from '../services/AppointmentService';
import { AppStyle } from './styles/styles';

export const AppointmentsList = ({ userId, containerStyle = {}, refreshKey = 0 }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

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
    }, [userId, refreshKey]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('¿Eliminar esta cita?');
        if (!confirmed) return;
        try {
            setDeletingId(id);
            const service = new AppointmentService();
            await service.deleteAppointment(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting appointment', err);
            alert('No se pudo eliminar la cita. Intente de nuevo.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div style={{ margin: '1rem auto', width: AppStyle.main.width }}>Cargando citas...</div>;

    return (
        <div style={{ 
            position: 'absolute',
            top: 0,
            right: -280,
            width: 260,
            maxHeight: 220,
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            border: '1px solid #e5e5e5',
            padding: '0.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            ...containerStyle
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>Citas</h4>
              <small style={{ color: '#666' }}>{appointments.length}</small>
            </div>
            {appointments.length === 0 && (
                <div style={{ padding: '0.5rem', color: '#666' }}>No tienes citas programadas.</div>
            )}
            {appointments.map(apt => (
                <div key={apt.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '0.5rem',
                    margin: '0.5rem 0',
                    borderRadius: '6px',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ flex: 1, marginRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>{apt.name}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#444' }}>{new Date(apt.date_time || apt.dateTime || apt.date).toLocaleString()}</div>
                    </div>
                    <div style={{ marginLeft: '0.5rem' }}>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        disabled={deletingId === apt.id}
                        style={{
                          border: 'none',
                          background: deletingId === apt.id ? '#ccc' : '#FF5B61',
                          color: 'white',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Eliminar cita"
                      >
                        {deletingId === apt.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

AppointmentsList.propTypes = {
    userId: PropTypes.string.isRequired,
    containerStyle: PropTypes.object,
    refreshKey: PropTypes.number
};