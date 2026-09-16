import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { session, setSession } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
    setSession(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {session?.user && (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{session.user.email}</Text>
          
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{session.user.id}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button title="Log Out" onPress={handleLogout} color="#ff3b30" />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 32,
  }
});
