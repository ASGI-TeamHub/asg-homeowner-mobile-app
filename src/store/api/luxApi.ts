import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Constants from 'expo-constants';
import { RootState } from '../index';
import { logout, refreshTokenSuccess } from '../slices/authSlice';
import {
  ApiResponse,
  AuthToken,
  BatteryQuote,
  FITPayment,
  GenerationHistory,
  LoginCredentials,
  MaintenanceBooking,
  NotificationPreferences,
  PaginatedResponse,
  PerformanceAlert,
  ServiceHistory,
  SolarSite,
  User,
} from '../../types';
import { clearTokens, getTokens, storeTokens } from '../../services/auth/tokenStorage';

const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
const LUX_API_BASE_URL = configuredBaseUrl || (__DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://lux.ashadegreener.co.uk/api/v1');

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${LUX_API_BASE_URL}/mobile`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token?.access;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refresh = (api.getState() as RootState).auth.token?.refresh || (await getTokens())?.refresh;

    if (refresh) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const payload = refreshResult.data as ApiResponse<AuthToken>;
        if (payload.data?.access) {
          api.dispatch(refreshTokenSuccess(payload.data));
          await storeTokens(payload.data);
          result = await rawBaseQuery(args, api, extraOptions);
        }
      } else {
        await clearTokens();
        api.dispatch(logout());
      }
    } else {
      await clearTokens();
      api.dispatch(logout());
    }
  }

  return result;
};

export const luxApi = createApi({
  reducerPath: 'luxApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Site', 'Generation', 'FIT', 'Maintenance', 'Notifications'],
  endpoints: (builder) => ({
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

    getSiteData: builder.query<ApiResponse<SolarSite>, string>({
      query: (siteId) => `/sites/${siteId}/dashboard`,
      providesTags: ['Site'],
    }),

    getLiveGeneration: builder.query<ApiResponse<{ current_kw: number; today_kwh: number }>, string>({
      query: (siteId) => `/sites/${siteId}/generation/live`,
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
      query: ({ siteId, serviceType, appointmentDate, timeSlot, specialRequirements }) => ({
        url: `/sites/${siteId}/maintenance/book`,
        method: 'POST',
        body: {
          service_type: serviceType,
          appointment_date: appointmentDate,
          time_slot: timeSlot,
          special_requirements: specialRequirements,
        },
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
      }),
    }),

    cancelBooking: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (bookingId) => ({
        url: `/maintenance/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Maintenance'],
    }),

    getBatteryQuote: builder.query<ApiResponse<BatteryQuote>, { siteId: string; usage_pattern: 'low' | 'medium' | 'high' }>({
      query: ({ siteId, usage_pattern }) => `/sites/${siteId}/battery-quote?usage_pattern=${usage_pattern}`,
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

    updateNotificationPreferences: builder.mutation<ApiResponse<{ success: boolean }>, NotificationPreferences>({
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

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useSetupBiometricsMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetSiteDataQuery,
  useGetLiveGenerationQuery,
  useGetGenerationHistoryQuery,
  useGetFITPaymentsQuery,
  useGetPerformanceAlertsQuery,
  useGetMaintenanceBookingsQuery,
  useGetServiceHistoryQuery,
  useGetAvailableSlotsQuery,
  useBookMaintenanceMutation,
  useUploadMaintenancePhotoMutation,
  useCancelBookingMutation,
  useGetBatteryQuoteQuery,
  useRequestBatteryConsultationMutation,
  useRegisterPushTokenMutation,
  useUpdateNotificationPreferencesMutation,
  useMarkNotificationReadMutation,
} = luxApi;
