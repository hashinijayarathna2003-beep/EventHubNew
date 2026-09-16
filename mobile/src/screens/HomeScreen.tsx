import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to EventHub!</Text>
      <Text style={styles.emailText}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
