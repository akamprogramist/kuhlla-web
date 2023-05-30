import { ActionTypes } from "../action-type";


const initialState = {
    status:'loading', //fulfill
    cart:null,
    checkout:null,
}

export const cartReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionTypes.SET_CART:
            return{
                ...state,
                status:"fulfill",
                cart:payload,
            }
        case ActionTypes.SET_CART_CHECKOUT:
            return {
                ...state,
                status:"fulfill",
                checkout:payload,
            }
        default:
            return state;
    }
}