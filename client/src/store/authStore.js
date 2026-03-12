import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // Login logic will be implemented in auth service
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  setToken: (token) => {
    set({ token });
    localStorage.setItem('token', token);
  },

  setUser: (user) => {
    set({ user });
  }
}));

export default useAuthStore;
