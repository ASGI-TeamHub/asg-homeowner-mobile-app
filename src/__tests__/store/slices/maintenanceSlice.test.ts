import { addBooking, maintenanceSlice } from '../../../store/slices/maintenanceSlice';

describe('maintenanceSlice', () => {
  it('adds booking', () => {
    const state = maintenanceSlice.reducer(undefined, addBooking({
      id: '1', site_id: 's1', service_type: 'repair', appointment_date: '2026-01-01', time_slot: 'morning', status: 'scheduled', priority: 'routine',
      estimated_duration_hours: 1, service_description: 'x',
    }));
    expect(state.bookings).toHaveLength(1);
  });
});
