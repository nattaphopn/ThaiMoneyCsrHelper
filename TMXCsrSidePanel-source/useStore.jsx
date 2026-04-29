import  {create}  from 'zustand';

const useStore = create((set) => ({
  showWatermark: false,
  setShowWatermark: (s) => set(() => ({ showWatermark: s })),
  user: {},
  setUser: (s) => set(() => ({ user: s }))
}));

export default useStore;