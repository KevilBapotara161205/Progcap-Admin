import { create } from 'zustand';

const getInitialState = () => {
  const token = localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('adminUser');
  if (token && userStr) {
    try {
      return { user: JSON.parse(userStr), accessToken: token, isAuthenticated: true };
    } catch (e) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  }
  return { user: null, accessToken: null, isAuthenticated: false };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  setAuth: (user, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ user: null, accessToken: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }
}));
