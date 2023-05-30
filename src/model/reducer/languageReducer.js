import { ActionTypes } from "../action-type";


const initialState = {
    status : "loading", //fulfill
    language : "english",
}

export const languageReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case ActionTypes.SET_LANGUAGE:
            return {
                status : "fulfill",
                language: payload,
            }
    
        default:
            return state;
    }
}