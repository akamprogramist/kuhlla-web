import { combineReducers } from "@reduxjs/toolkit";
import { locationReducer } from "./locationReducer";
import { cssmodeReducer } from './cssmodeReducer';
import { languageReducer } from "./languageReducer";
import { categoryReducer } from "./categoryReducer";
import { authReducer } from './authReducer';
import { productFilterReducer } from "./productFilterReducer";
import { selectedProductReducer } from "./selectedProduct";
import {cartReducer} from './cartReducer';
import {productSizesReducer} from './productSizesReducer'
import { favotiteReducer } from "./favoriteReducer";
import { shopReducer } from "./shopReducer";
import { notificationReducer } from "./notificationReducer";
import { settingReducer } from "./settingReducer";

const reducers = combineReducers({
    city:locationReducer,
    cssmode:cssmodeReducer,
    shop:shopReducer,
    language:languageReducer,
    category:categoryReducer,
    user:authReducer,
    productFilter:productFilterReducer,
    selectedProduct:selectedProductReducer,
    cart:cartReducer,
    favorite:favotiteReducer,
    productSizes:productSizesReducer,
    notification: notificationReducer,
    setting:settingReducer,
})

export default reducers;