import { setSiteData, solarSlice } from '../../../store/slices/solarSlice';

describe('solarSlice', () => {
  it('sets site data', () => {
    const state = solarSlice.reducer(undefined, setSiteData({
      id: '1', reference: 'R1', postcode: 'S75', installation_date: '', panel_capacity_kw: 4, inverter_type: '', orientation: 'south', tilt_angle: 30,
      current_generation_kw: 0, today_generation_kwh: 0, monthly_generation_kwh: 0, yearly_generation_kwh: 0, fit_rate_per_kwh: 0.15,
      export_rate_per_kwh: 0.1, estimated_monthly_payment: 0, system_health: 'good', last_reading_date: '', consecutive_zero_reads: 0,
      current_weather: { temperature_c: 10, conditions: 'cloudy', cloud_cover_percent: 50, wind_speed_kmh: 10, solar_irradiance: 200, forecast_generation_kwh: 5 },
    }));
    expect(state.currentSite?.reference).toBe('R1');
  });
});
