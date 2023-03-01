import { AnyAction, configureStore, Store, ThunkDispatch } from "@reduxjs/toolkit"
import rootReducer from "./rootReducer"

const store = configureStore({
	devTools: process.env.NODE_ENV !== 'production',
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
})
export type RootState = ReturnType<typeof store.getState>
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type AppStore = Omit<Store<RootState, AnyAction>, "dispatch"> & {
	dispatch: AppThunkDispatch
}


export default store;