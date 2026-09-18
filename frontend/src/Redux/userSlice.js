import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setname: (state, action) => {
      state.name = action.payload;
    },
    setemail: (state, action) => {
      state.email = action.payload;
    },
    setisLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export const { setname, setisLoggedIn, setemail } = userSlice.actions;
export default userSlice.reducer;
