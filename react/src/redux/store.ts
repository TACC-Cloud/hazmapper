import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './reducers/reducers';

export default configureStore({
  reducer: reducer,
});
