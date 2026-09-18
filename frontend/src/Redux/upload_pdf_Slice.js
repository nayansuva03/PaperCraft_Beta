import { createSlice } from "@reduxjs/toolkit";

const upload_Pdf_Slice = createSlice({
    name: "uploaded_pdf",
    initialState: {
        file: [],
    },
    reducers:{
        set_upload_Pdf: (state, action) => {
            state.file = action.payload;
        },
    },
});

export const {set_upload_Pdf} = upload_Pdf_Slice.actions;
export default upload_Pdf_Slice.reducer;