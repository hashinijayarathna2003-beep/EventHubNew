import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to reach localhost, otherwise localhost for iOS/web
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

const getHeaders = async () => {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }
    return response.json();
  },
};
