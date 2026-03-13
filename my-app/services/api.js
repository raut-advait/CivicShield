import axios from 'axios';
import { Platform } from 'react-native';

// Set this in app config/env when using a physical device:
// EXPO_PUBLIC_API_URL=http://<your-computer-ip>:5002
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5002' : 'http://localhost:5002');

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

/**
 * Verifies a claim against government evidence.
 * @param {string} text - Claim text to verify.
 * @returns {Promise<Object>} Verification response with classification and evidence.
 */
export async function verifyInformation(text) {
  try {
    const response = await api.post('/verify', { text });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Server error. Please try again.'
      );
    } else if (error.request) {
      throw new Error(
        `Network timeout/reachability issue. Check backend at ${BASE_URL}.`
      );
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

/**
 * Searches the backend for related government records and evidence.
 * @param {string} text - The claim text to search.
 * @returns {Promise<{ results: Array<{ title: string, url: string, snippet: string }> }>}
 */
export async function searchClaim(text) {
  try {
    const response = await api.post('/search', { text });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Server error. Please try again.'
      );
    } else if (error.request) {
      throw new Error(
        `Network timeout/reachability issue. Check backend at ${BASE_URL}.`
      );
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

/**
 * Fetches latest government scheme/policy notifications.
 * @param {{ limit?: number, category?: string }} options - Optional query options.
 * @returns {Promise<{ status: string, count: number, data: Array }>} Notifications response.
 */
export async function getNotifications(options = {}) {
  try {
    const params = {};
    if (options.limit != null) params.limit = options.limit;
    if (options.category) params.category = options.category;
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Server error. Please try again.'
      );
    } else if (error.request) {
      throw new Error(
        `Network timeout/reachability issue. Check backend at ${BASE_URL}.`
      );
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

export const searchNews = searchClaim;
