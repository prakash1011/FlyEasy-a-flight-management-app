import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  modalContent: null,
  modalType: null,
  isSidebarOpen: false,
  isLoading: false,
  theme: 'dark', // Default to dark theme as per user preference
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalContent = action.payload.content;
      state.modalType = action.payload.type;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalContent = null;
      state.modalType = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDarkTheme: (state) => {
      state.theme = 'dark';
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setLoading,
  setDarkTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
