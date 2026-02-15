import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import {
  User,
  SolarSite,
  GenerationHistory,
  FITPayment,
  MaintenanceBooking,
  ServiceHistory,
  PerformanceAlert,
  BatteryQuote,
  ApiResponse,
  PaginatedResponse,
  LoginCredentials,
  AuthToken,
} from '../../types';

// Base URL for Lux API - will be environment-specific
const LUX_API_BASE_URL = __DEV__ 
  ? 'http://10.75.0.49:8000/api/v1' 
  : 'https://lux.ashadegreener.co.uk/api/v1';

export const luxApi = createApi({
  reducerPath: 'luxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${LUX_API_BASE_URL}/mobile`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.access;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Site', 'Generation', 'FIT', 'Maintenance', 'Notifications'],
  endpoints: (builder) => ({
    
    // Authentication endpoints
    login: builder.mutation<ApiResponse<{ user: User; token: AuthToken }>, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<ApiResponse<AuthToken>, string>({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),

    setupBiometrics: builder.mutation<ApiResponse<{ success: boolean }>, { device_id: string; biometric_key: string }>({
      query: (payload) => ({
        url: '/auth/biometric-setup',
        method: 'POST',
        body: payload,
      }),
    }),

    // User profile endpoints
    getUserProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (updates) => ({
        url: '/user/profile',
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),

    // Solar site endpoints
    getSiteData: builder.query<ApiResponse<SolarSite>, string>({
      query: (siteId) => `/sites/${siteId}/dashboard`,
      providesTags: ['Site'],
    }),

    getLiveGeneration: builder.query<ApiResponse<{ current_kw: number; today_kwh: number }>, string>({
      query: (siteId) => `/sites/${siteId}/generation/live`,
      // Poll every 30 seconds for live data
      pollingInterval: 30000,
    }),

    getGenerationHistory: builder.query<ApiResponse<GenerationHistory[]>, { siteId: string; period: 'week' | 'month' | 'year' }>({
      query: ({ siteId, period }) => `/sites/${siteId}/generation/history?period=${period}`,
      providesTags: ['Generation'],
    }),

    getFITPayments: builder.query<ApiResponse<PaginatedResponse<FITPayment>>, { siteId: string; page?: number }>({
      query: ({ siteId, page = 1 }) => `/sites/${siteId}/fit-payments?page=${page}`,
      providesTags: ['FIT'],
    }),

    getPerformanceAlerts: builder.query<ApiResponse<PerformanceAlert[]>, string>({
      query: (siteId) => `/sites/${siteId}/alerts`,
      providesTags: ['Notifications'],
    }),

    // Maintenance endpoints
    getMaintenanceBookings: builder.query<ApiResponse<MaintenanceBooking[]>, string>({
      query: (siteId) => `/sites/${siteId}/maintenance/bookings`,
      providesTags: ['Maintenance'],
    }),

    getServiceHistory: builder.query<ApiResponse<ServiceHistory[]>, string>({
      query: (siteId) => `/sites/${siteId}/maintenance/history`,
      providesTags: ['Maintenance'],
    }),

    getAvailableSlots: builder.query<ApiResponse<string[]>, { siteId: string; serviceType: string }>({
      query: ({ siteId, serviceType }) => `/sites/${siteId}/maintenance/available-slots?service_type=${serviceType}`,
    }),

    bookMaintenance: builder.mutation<ApiResponse<MaintenanceBooking>, {
      siteId: string;
      serviceType: string;
      appointmentDate: string;
      timeSlot: string;
      specialRequirements?: string;
    }>({
      query: ({ siteId, ...bookingData }) => ({
        url: `/sites/${siteId}/maintenance/book`,
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Maintenance'],
    }),

    uploadMaintenancePhoto: builder.mutation<ApiResponse<{ url: string }>, {
      bookingId: string;
      photo: FormData;
    }>({
      query: ({ bookingId, photo }) => ({
        url: `/maintenance/${bookingId}/upload-photo`,
        method: 'POST',
        body: photo,
        formData: true,
      }),
    }),

    cancelBooking: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (bookingId) => ({
        url: `/maintenance/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Maintenance'],
    }),

    // Battery and upsell endpoints
    getBatteryQuote: builder.query<ApiResponse<BatteryQuote>, { siteId: string; usage_pattern: 'low' | 'medium' | 'high' }>({
      query: ({ siteId, usage_pattern }) => `/sites/${siteId}/battery-quote?usage=${usage_pattern}`,
    }),

    requestBatteryConsultation: builder.mutation<ApiResponse<{ success: boolean }>, {
      siteId: string;
      preferred_contact: 'phone' | 'email';
      availability: string;
    }>({
      query: ({ siteId, ...consultationData }) => ({
        url: `/sites/${siteId}/battery-consultation`,
        method: 'POST',
        body: consultationData,
      }),
    }),

    // Notification endpoints
    registerPushToken: builder.mutation<ApiResponse<{ success: boolean }>, {
      device_id: string;
      push_token: string;
      platform: 'ios' | 'android';
    }>({
      query: (tokenData) => ({
        url: '/notifications/register-device',
        method: 'POST',
        body: tokenData,
      }),
    }),

    updateNotificationPreferences: builder.mutation<ApiResponse<{ success: boolean }>, {
      maintenance_reminders: boolean;
      performance_alerts: boolean;
      payment_notifications: boolean;
      system_updates: boolean;
      marketing_emails: boolean;
    }>({
      query: (preferences) => ({
        url: '/notifications/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User'],
    }),

    markNotificationRead: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/mark-read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

  }),
});

// Export hooks for use in components
export const {
  // Auth
  useLoginMutation,
  useRefreshTokenMutation,
  useSetupBiometricsMutation,
  
  // User
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  
  // Solar data
  useGetSiteDataQuery,
  useGetLiveGenerationQuery,
  useGetGenerationHistoryQuery,
  useGetFITPaymentsQuery,
  useGetPerformanceAlertsQuery,
  
  // Maintenance
  useGetMaintenanceBookingsQuery,
  useGetServiceHistoryQuery,
  useGetAvailableSlotsQuery,
  useBookMaintenanceMutation,
  useUploadMaintenancePhotoMutation,
  useCancelBookingMutation,
  
  // Battery/Upsell
  useGetBatteryQuoteQuery,
  useRequestBatteryConsultationMutation,
  
  // Notifications
  useRegisterPushTokenMutation,
  useUpdateNotificationPreferencesMutation,
  useMarkNotificationReadMutation,
} = luxApi;