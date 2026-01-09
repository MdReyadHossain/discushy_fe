import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";
import apiSlice from "./apiSlice";

const sagaMiddleware = createSagaMiddleware();

export function makeStore() {
    const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware, apiSlice.middleware),
        devTools: typeof window !== "undefined",
    });

    setupListeners(store.dispatch);
    sagaMiddleware.run(rootSaga);

    return store;
}

export const store = makeStore();

export type store = ReturnType<typeof makeStore>;

export type RootState = ReturnType<store['getState']>;
export type AppDispatch = store['dispatch'];
