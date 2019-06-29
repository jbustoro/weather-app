import { createActions } from "redux-actions";
import { ActionTypes } from "../constants";

export const { getWeather } = createActions({
  [ActionTypes.GET_WEATHER]: query => ({ query })
});
