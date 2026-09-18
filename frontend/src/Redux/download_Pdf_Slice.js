import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  generatedContent: { questions: [] },
  backgroundImage: null,
  instituteLogo: null,
  isLoading: false,
};

const download_Pdf_Slice = createSlice({
  name: "pdf",
  initialState,
  reducers: {
    setGeneratedContent: (state, action) => {
      state.generatedContent = action.payload;
    },
    setBackgroundImage: (state, action) => {
      state.backgroundImage = action.payload;
    },
    setInstituteLogo: (state, action) => {
      state.instituteLogo = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setGeneratedContent,
  setBackgroundImage,
  setInstituteLogo,
  setLoading,
} = download_Pdf_Slice.actions;
export default download_Pdf_Slice.reducer;
