// Core data models for ASG Solar app

export interface User {
  id: string;
  email: string;
  site_reference: string;
  first_name: string;
  last_name: string;
  phone?: string;
  postcode: string;
  biometric_enabled: boolean;
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  maintenance_reminders: boolean;
  performance_alerts: boolean;
  payment_notifications: boolean;
  system_updates: boolean;
  marketing_emails: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface SolarSite {
  id: string;
  reference: string;
  postcode: string;
  installation_date: string;
  panel_capacity_kw: number;
  inverter_type: string;
  orientation: 'south' | 'south-east' | 'south-west' | 'east' | 'west';
  tilt_angle: number;
  current_generation_kw: number;
  today_generation_kwh: number;
  monthly_generation_kwh: number;
  yearly_generation_kwh: number;
  fit_rate_per_kwh: number;
  export_rate_per_kwh: number;
  estimated_monthly_payment: number;
  system_health: 'good' | 'warning' | 'error' | 'offline';
  last_reading_date: string;
  consecutive_zero_reads: number;
  current_weather: WeatherData;
}

export interface WeatherData {
  temperature_c: number;
  conditions: 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'snow';
  cloud_cover_percent: number;
  wind_speed_kmh: number;
  solar_irradiance: number;
  forecast_generation_kwh: number;
}

export interface GenerationHistory {
  date: string;
  generation_kwh: number;
  export_kwh: number;
  consumption_kwh: number;
  weather_conditions: string;
  irradiance_wh_m2: number;
  temperature_c: number;
}

export interface FITPayment {
  id: string;
  period_start: string;
  period_end: string;
  generation_kwh: number;
  export_kwh: number;
  generation_payment: number;
  export_payment: number;
  total_payment: number;
  payment_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  statement_url?: string;
}

export interface MaintenanceBooking {
  id: string;
  site_id: string;
  service_type: 'annual_check' | 'repair' | 'cleaning' | 'inverter_service';
  appointment_date: string;
  time_slot: 'morning' | 'afternoon' | 'all_day';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'emergency';
  technician_name?: string;
  estimated_duration_hours: number;
  service_description: string;
  special_requirements?: string;
  work_completed?: string;
  parts_replaced?: string[];
  follow_up_required?: boolean;
  customer_rating?: number;
  customer_feedback?: string;
  before_photos?: string[];
  after_photos?: string[];
  service_report_url?: string;
}

export interface ServiceHistory {
  id: string;
  date: string;
  service_type: string;
  technician: string;
  work_performed: string;
  parts_replaced: string[];
  cost: number;
  warranty_extended?: boolean;
  next_service_due?: string;
  photos: string[];
  report_url?: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'zero_reads' | 'low_generation' | 'system_fault' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  action_required?: string;
  estimated_cost?: number;
}

export interface BatteryQuote {
  id: string;
  battery_capacity_kwh: number;
  estimated_cost: number;
  monthly_savings_estimate: number;
  payback_period_years: number;
  installation_date_estimate: string;
  quote_valid_until: string;
  includes_installation: boolean;
  warranty_years: number;
  brand: string;
  model: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Maintenance: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  BiometricSetup: undefined;
  SiteVerification: undefined;
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface LoginCredentials {
  site_reference: string;
  postcode: string;
  meter_serial?: string;
}

export interface AuthToken {
  access: string;
  refresh: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export interface SolarState {
  currentSite: SolarSite | null;
  generationHistory: GenerationHistory[];
  fitPayments: FITPayment[];
  performanceAlerts: PerformanceAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface MaintenanceState {
  bookings: MaintenanceBooking[];
  history: ServiceHistory[];
  availableSlots: string[];
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  pushToken: string | null;
  preferences: NotificationPreferences;
}
