# ASG Mobile API Specification

## Overview
Backend API extensions needed for the ASG Homeowner Mobile App, built on top of the existing Lux Django API.

**Base URL:** `https://lux.ashadegreener.co.uk/api/v1/mobile`

## Authentication

All mobile API endpoints require JWT authentication with the following header:
```
Authorization: Bearer {access_token}
```

### POST /auth/login
Login with site reference and postcode verification.

**Request:**
```json
{
  "site_reference": "ASG123456",
  "postcode": "S70 2YW",
  "meter_serial": "12345678" // Optional for additional verification
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "homeowner@example.com",
      "site_reference": "ASG123456", 
      "first_name": "John",
      "last_name": "Smith",
      "phone": "+44123456789",
      "postcode": "S70 2YW",
      "biometric_enabled": false,
      "notification_preferences": {
        "maintenance_reminders": true,
        "performance_alerts": true,
        "payment_notifications": true,
        "system_updates": true,
        "marketing_emails": false
      }
    },
    "token": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "expires_at": 1671234567890
    }
  }
}
```

### POST /auth/refresh
Refresh expired access token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_at": 1671234567890
  }
}
```

### POST /auth/biometric-setup
Enable biometric authentication for user device.

**Request:**
```json
{
  "device_id": "iPhone-12345-ABCDEF",
  "biometric_key": "base64-encoded-biometric-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## User Profile

### GET /user/profile
Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "homeowner@example.com",
    "site_reference": "ASG123456",
    "first_name": "John",
    "last_name": "Smith", 
    "phone": "+44123456789",
    "postcode": "S70 2YW",
    "biometric_enabled": true,
    "notification_preferences": {
      "maintenance_reminders": true,
      "performance_alerts": true,
      "payment_notifications": true,
      "system_updates": true,
      "marketing_emails": false
    }
  }
}
```

### PATCH /user/profile  
Update user profile information.

**Request:**
```json
{
  "first_name": "John",
  "phone": "+44987654321",
  "notification_preferences": {
    "maintenance_reminders": false,
    "performance_alerts": true,
    "payment_notifications": true,
    "system_updates": true,
    "marketing_emails": true
  }
}
```

## Solar Site Data

### GET /sites/{site_id}/dashboard
Get comprehensive site data for dashboard display.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "site-uuid",
    "reference": "ASG123456",
    "postcode": "S70 2YW", 
    "installation_date": "2020-03-15",
    "panel_capacity_kw": 4.2,
    "inverter_type": "SolarEdge SE4000H",
    "orientation": "south",
    "tilt_angle": 35,
    
    "current_generation_kw": 2.8,
    "today_generation_kwh": 12.4,
    "monthly_generation_kwh": 340.7,
    "yearly_generation_kwh": 4250.3,
    
    "fit_rate_per_kwh": 0.15,
    "export_rate_per_kwh": 0.05,
    "estimated_monthly_payment": 51.11,
    
    "system_health": "good",
    "last_reading_date": "2024-02-15T14:30:00Z",
    "consecutive_zero_reads": 0,
    
    "current_weather": {
      "temperature_c": 8,
      "conditions": "sunny",
      "cloud_cover_percent": 20,
      "wind_speed_kmh": 15,
      "solar_irradiance": 450,
      "forecast_generation_kwh": 15.2
    }
  }
}
```

### GET /sites/{site_id}/generation/live
Get real-time generation data (updated every 5 minutes).

**Response:**
```json
{
  "success": true,
  "data": {
    "current_kw": 2.8,
    "today_kwh": 12.4,
    "timestamp": "2024-02-15T14:30:00Z"
  }
}
```

### GET /sites/{site_id}/generation/history
Get historical generation data for charts.

**Query Parameters:**
- `period`: "week" | "month" | "year"
- `start_date`: ISO date (optional)
- `end_date`: ISO date (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-02-15",
      "generation_kwh": 12.4,
      "export_kwh": 8.2,
      "consumption_kwh": 4.2,
      "weather_conditions": "sunny",
      "irradiance_wh_m2": 450,
      "temperature_c": 8
    }
  ]
}
```

### GET /sites/{site_id}/fit-payments
Get FIT payment history with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "payment-uuid",
        "period_start": "2024-01-01",
        "period_end": "2024-01-31",
        "generation_kwh": 280.5,
        "export_kwh": 180.3,
        "generation_payment": 42.08,
        "export_payment": 9.02,
        "total_payment": 51.10,
        "payment_date": "2024-02-15",
        "status": "paid",
        "statement_url": "https://portal.ashadegreener.co.uk/statements/2024-01.pdf"
      }
    ],
    "count": 48,
    "next": "https://api/sites/123/fit-payments?page=2",
    "previous": null
  }
}
```

### GET /sites/{site_id}/alerts
Get performance alerts and system notifications.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-uuid",
      "type": "zero_reads",
      "severity": "medium",
      "title": "No Generation Detected",
      "description": "Your system hasn't generated power for 2 days. This could be due to cloudy weather or a technical issue.",
      "created_at": "2024-02-15T10:00:00Z",
      "resolved_at": null,
      "action_required": "Monitor for another day. If persists, book maintenance check.",
      "estimated_cost": 85.00
    }
  ]
}
```

## Maintenance

### GET /sites/{site_id}/maintenance/bookings
Get current and future maintenance bookings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "site_id": "site-uuid", 
      "service_type": "annual_check",
      "appointment_date": "2024-03-15",
      "time_slot": "morning",
      "status": "confirmed",
      "priority": "routine",
      "technician_name": "Mike Johnson",
      "estimated_duration_hours": 2,
      "service_description": "Annual system health check and cleaning",
      "special_requirements": "Access through back garden gate"
    }
  ]
}
```

### GET /sites/{site_id}/maintenance/history  
Get completed maintenance history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "date": "2023-03-20",
      "service_type": "Annual Check",
      "technician": "Mike Johnson", 
      "work_performed": "System health check, panel cleaning, inverter inspection",
      "parts_replaced": ["DC isolator switch"],
      "cost": 85.00,
      "warranty_extended": true,
      "next_service_due": "2024-03-20",
      "photos": [
        "https://cdn.asg.com/service-photos/before-123.jpg",
        "https://cdn.asg.com/service-photos/after-123.jpg"
      ],
      "report_url": "https://portal.ashadegreener.co.uk/service-reports/2023-03-20.pdf"
    }
  ]
}
```

### GET /sites/{site_id}/maintenance/available-slots
Get available appointment slots for booking.

**Query Parameters:**
- `service_type`: "annual_check" | "repair" | "cleaning" | "inverter_service"
- `from_date`: ISO date (default: today)

**Response:**
```json
{
  "success": true,
  "data": [
    "2024-03-15T09:00:00Z",
    "2024-03-15T14:00:00Z", 
    "2024-03-16T09:00:00Z",
    "2024-03-18T14:00:00Z"
  ]
}
```

### POST /sites/{site_id}/maintenance/book
Book a maintenance appointment.

**Request:**
```json
{
  "service_type": "annual_check",
  "appointment_date": "2024-03-15T09:00:00Z",
  "time_slot": "morning",
  "special_requirements": "Please call before arriving"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "appointment_date": "2024-03-15T09:00:00Z",
    "status": "scheduled",
    "confirmation_number": "ASG-MAINT-123456",
    "technician_contact": "+44123456789"
  }
}
```

### POST /maintenance/{booking_id}/upload-photo
Upload maintenance photos (before/after service).

**Request:** FormData with photo file
```
photo: [File] // Image file (JPEG/PNG, max 10MB)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.asg.com/maintenance-photos/booking-123-photo-1.jpg"
  }
}
```

### POST /maintenance/{booking_id}/cancel
Cancel a maintenance booking.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Battery & Upselling

### GET /sites/{site_id}/battery-quote
Get battery storage quote based on usage patterns.

**Query Parameters:**
- `usage_pattern`: "low" | "medium" | "high"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "quote-uuid",
    "battery_capacity_kwh": 10.0,
    "estimated_cost": 8500.00,
    "monthly_savings_estimate": 85.00,
    "payback_period_years": 8.3,
    "installation_date_estimate": "2024-04-15",
    "quote_valid_until": "2024-03-15",
    "includes_installation": true,
    "warranty_years": 10,
    "brand": "Tesla Powerwall",
    "model": "Powerwall 2"
  }
}
```

### POST /sites/{site_id}/battery-consultation
Request battery consultation appointment.

**Request:**
```json
{
  "preferred_contact": "phone",
  "availability": "weekday_mornings"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "consultation_id": "consult-uuid",
    "expected_callback": "within_48_hours"
  }
}
```

## Notifications

### POST /notifications/register-device
Register device for push notifications.

**Request:**
```json
{
  "device_id": "iPhone-12345-ABCDEF",
  "push_token": "firebase-push-token-here",
  "platform": "ios"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

### PUT /notifications/preferences
Update notification preferences.

**Request:**
```json
{
  "maintenance_reminders": true,
  "performance_alerts": true,
  "payment_notifications": false,
  "system_updates": true,
  "marketing_emails": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

### GET /notifications
Get recent notifications for user.

**Query Parameters:**
- `limit`: Number of notifications (default: 20, max: 100)
- `unread_only`: boolean (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "type": "performance_alert",
      "title": "Low Generation Alert",
      "body": "Your system generated 30% less than expected yesterday",
      "read": false,
      "created_at": "2024-02-15T10:00:00Z",
      "action_url": "/sites/123/alerts"
    }
  ]
}
```

### POST /notifications/{notification_id}/mark-read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Authentication failed",
  "errors": [
    {
      "field": "site_reference",
      "message": "Site reference not found"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions) 
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **Authentication endpoints:** 5 requests per minute per IP
- **Data endpoints:** 100 requests per minute per user
- **File uploads:** 10 requests per minute per user

## Implementation Notes

### Database Changes Required
1. **User model extension:** Add mobile-specific fields (device_id, biometric_enabled, push_token)
2. **Maintenance bookings:** New table for appointment scheduling
3. **Notification preferences:** User preference storage  
4. **Device registration:** Track registered devices per user
5. **API rate limiting:** Redis-based rate limit tracking

### Security Considerations
- **JWT token expiry:** 15 minutes for access tokens, 7 days for refresh
- **Device binding:** Biometric keys tied to specific device IDs
- **Input validation:** Strict validation on all user inputs
- **File upload limits:** 10MB max per photo, virus scanning required
- **Rate limiting:** Prevent API abuse and DoS attacks

### Performance Requirements
- **Response time:** < 200ms for dashboard data
- **Concurrency:** Support 10,000+ concurrent users
- **Caching:** Redis caching for frequently accessed data
- **CDN:** Photo and file storage via AWS S3 + CloudFront

This API specification provides complete backend support for the ASG Homeowner Mobile App, enabling real-time solar monitoring, maintenance management, and customer upselling opportunities.