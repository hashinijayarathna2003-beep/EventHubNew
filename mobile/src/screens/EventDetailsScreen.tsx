import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (error) {
      console.error('Error fetching event details:', error);
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to book an event.');
      return;
    }
    
    const { data, error } = await supabase.from('bookings').insert([
      {
        user_id: session.user.id,
        event_id: event.id,
        seats: 1,
        status: 'confirmed'
      }
    ]);

    if (error) {
      Alert.alert('Booking Failed', error.message);
    } else {
      Alert.alert('Success!', 'Your booking is confirmed.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      <Text style={styles.detail}>Date: {event.date_time}</Text>
      <Text style={styles.detail}>Location: {event.location}</Text>
      <Text style={styles.detail}>Seats left: {event.total_seats}</Text>
      <Text style={styles.price}>${event.price}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Book Now" onPress={handleBook} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    marginBottom: 16,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 32,
  }
});
