import { createSlice } from '@reduxjs/toolkit';
import { geoapi } from './api/geoapi';

// TODO_REACT: REMOVE AS NOT USED
const slice = createSlice({
  name: 'projects',
  initialState: { projects: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      geoapi.endpoints.getGeoapiProjects.matchFulfilled,
      (state, { payload }) => {
        state.projects = payload;
      }
    );
  },
});

export default slice.reducer;
