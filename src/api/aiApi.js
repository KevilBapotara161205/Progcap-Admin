/**
 * AI API functions — Admin Panel
 * All calls are offline-safe: return null on any error.
 */

import apiClient from './axiosClient';

/** Check if AI service is reachable */
export const checkAIHealth = async () => {
  try {
    const res = await apiClient.get('/ai/health', { timeout: 5000 });
    return res.data?.data?.online === true;
  } catch {
    return false;
  }
};

/** Feature 1: Merchant/Dealer X-Ray for admin panel */
export const getDealerXray = async (dealerId) => {
  try {
    const res = await apiClient.post('/ai/merchant-xray', { dealerId }, { timeout: 35000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

/** Feature 10: Platform-level admin insights */
export const getAdminInsights = async () => {
  try {
    const res = await apiClient.get('/ai/admin-insights', { timeout: 40000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

/** Feature 8: Smart search filter extraction */
export const smartSearch = async (query) => {
  try {
    const res = await apiClient.post('/ai/smart-search', { query }, { timeout: 20000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};
