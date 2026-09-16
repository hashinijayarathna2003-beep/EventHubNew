import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    // Fetch bookings and join with events
    const { data, error } = await supabase
      .from('bookings')
      .select('*, event:events(*)')
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Booking cancelled.');
      fetchBookings(); // Refresh the list
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.event?.title || 'Unknown Event'}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Seats: {item.seats}</Text>
      {item.status === 'confirmed' && (
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => {
            Alert.alert(
              'Cancel Booking', 
              'Are you sure you want to cancel this booking?', 
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => handleCancelBooking(item.id), style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
        <Text>You have no bookings.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBooking}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#ff3b30',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
