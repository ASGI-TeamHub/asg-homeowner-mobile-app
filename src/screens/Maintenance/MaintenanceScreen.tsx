import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import AppCard from '../../components/AppCard';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector } from '../../store';
import {
  useBookMaintenanceMutation,
  useCancelBookingMutation,
  useGetAvailableSlotsQuery,
  useGetMaintenanceBookingsQuery,
  useGetServiceHistoryQuery,
  useUploadMaintenancePhotoMutation,
} from '../../store/api/luxApi';

export default function MaintenanceScreen() {
  const siteId = useAppSelector((state) => state.auth.user?.site_reference || '');
  const bookingsQuery = useGetMaintenanceBookingsQuery(siteId, { skip: !siteId });
  const historyQuery = useGetServiceHistoryQuery(siteId, { skip: !siteId });

  const [serviceType, setServiceType] = useState('annual_check');
  const slotsQuery = useGetAvailableSlotsQuery({ siteId, serviceType }, { skip: !siteId });
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const [bookMaintenance, bookingState] = useBookMaintenanceMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [uploadPhoto] = useUploadMaintenancePhotoMutation();

  const submitBooking = async () => {
    try {
      await bookMaintenance({ siteId, serviceType, appointmentDate, timeSlot, specialRequirements }).unwrap();
      Alert.alert('Booked', 'Your maintenance appointment has been booked.');
    } catch {
      Alert.alert('Error', 'Unable to book maintenance right now.');
    }
  };

  const pickAndUpload = async (bookingId: string) => {
    const image = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    const uri = image.assets?.[0]?.uri;
    if (!uri) return;
    const form = new FormData();
    form.append('photo', { uri, type: image.assets?.[0]?.type || 'image/jpeg', name: image.assets?.[0]?.fileName || 'photo.jpg' } as never);
    await uploadPhoto({ bookingId, photo: form }).unwrap();
    Alert.alert('Uploaded', 'Photo uploaded.');
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={bookingsQuery.isFetching || historyQuery.isFetching} onRefresh={() => { void bookingsQuery.refetch(); void historyQuery.refetch(); }} />}>
      <AppCard>
        <Text style={styles.cardTitle}>Book Service</Text>
        <Input label="Service Type" value={serviceType} onChangeText={setServiceType} accessibilityLabel="Service type" />
        <Input label="Date (YYYY-MM-DD)" value={appointmentDate} onChangeText={setAppointmentDate} accessibilityLabel="Appointment date" />
        <Input label="Time Slot" value={timeSlot} onChangeText={setTimeSlot} accessibilityLabel="Time slot" />
        <Input label="Special Requirements" value={specialRequirements} onChangeText={setSpecialRequirements} accessibilityLabel="Special requirements" />
        <Text>Available slots: {(slotsQuery.data?.data || []).join(', ') || 'None'}</Text>
        <Button title="Submit" loading={bookingState.isLoading} onPress={submitBooking} accessibilityLabel="Submit maintenance booking" />
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Current Bookings</Text>
        {(bookingsQuery.data?.data || []).map((booking) => (
          <View key={booking.id} style={styles.item}>
            <Text>{booking.service_type} • {booking.appointment_date} ({booking.time_slot})</Text>
            <View style={styles.actionsRow}>
              <Button title="Upload Photo" type="outline" onPress={() => void pickAndUpload(booking.id)} />
              <Button title="Cancel" type="clear" onPress={() => void cancelBooking(booking.id)} />
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Service History</Text>
        {(historyQuery.data?.data || []).map((item) => (
          <Text key={item.id}>{item.date}: {item.work_performed}</Text>
        ))}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#003d82', marginBottom: 10 },
  item: { marginBottom: 8 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
