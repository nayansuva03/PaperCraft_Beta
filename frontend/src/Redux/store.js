import { configureStore } from "@reduxjs/toolkit";
import DownloadpdfReducer from "./download_Pdf_Slice";
import UploadpdfReducer from "./upload_pdf_Slice";
import userReducer from "./userSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    Downloaded_pdf: DownloadpdfReducer,
    Uploaded_pdf: UploadpdfReducer,
    user: userReducer,
    theme: themeReducer,
  },
});
