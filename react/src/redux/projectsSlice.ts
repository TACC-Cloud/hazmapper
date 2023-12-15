import { createSlice } from '@reduxjs/toolkit';
import { geoapi } from './api/geoapi';

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
