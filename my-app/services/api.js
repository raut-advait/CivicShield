import axios from 'axios';
import { Platform } from 'react-native';

// Set this in app config/env when using a physical device:
// EXPO_PUBLIC_API_URL=http://<your-computer-ip>:5000
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * Sends a claim to the backend fact-check API.
 * @param {string} text - The claim text to verify.
 * @returns {Promise<Object>} The fact-check result.
 */
export async function verifyClaim(text) {
  try {
    const response = await api.post('/factcheck', { text });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server returned an error response
      throw new Error(
        error.response.data?.error || 'Server error. Please try again.'
      );
    } else if (error.request) {
      // No response received
      throw new Error(
        `Network timeout/reachability issue. Check backend at ${BASE_URL}.`
      );
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}
