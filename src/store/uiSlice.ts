import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  mobileMenuOpen: boolean;
  activeCategory: string;
  search: string;
  faqOpen: number | null;
};

const initialState: UiState = {
  mobileMenuOpen: false,
  activeCategory: "همه",
  search: "",
  faqOpen: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    setActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFaqOpen(state, action: PayloadAction<number | null>) {
      state.faqOpen = action.payload;
    },
  },
});

export const { setMobileMenuOpen, setActiveCategory, setSearch, setFaqOpen } = uiSlice.actions;
export default uiSlice.reducer;
