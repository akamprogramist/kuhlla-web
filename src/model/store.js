import { configureStore } from "@reduxjs/toolkit";
import reducers from './reducer/index'
// import {
//     persistStore,
//     persistReducer,
//     FLUSH,
//     REHYDRATE,
//     PAUSE,
//     PERSIST,
//     PURGE,
//     REGISTER
// } from "redux-persist";
// import storage from "redux-persist/lib/storage";

// const persistConfig = {
//     key: 'root',
//     version: 1,
//     storage,
// }

// const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
    // reducer: persistedReducer,
    reducer:reducers,
    devTools: process.env.NODE_ENV !== 'production',
    // middleware: getDefaultMiddleware =>
    //     getDefaultMiddleware({
    //         serializableCheck: {
    //             ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    //         }
    //     })
})

// const Persiststore = persistStore(store);
// export { Persiststore }

export default store;