import immutable from "immutability-helper";
import { handleActions } from "redux-actions";
import { ActionTypes, STATUS } from "../constants";
import { parseError } from "../modules/client";

export const weatherState = {
  data: {},
  message: "",
  query: "",
  status: STATUS.IDLE
};

export default {
  weather: handleActions(
    {
      [ActionTypes.GET_WEATHER]: (state, { payload }) =>
        immutable(state, {
          data: { $set: {} },
          message: { $set: "" },
          query: { $set: payload.query },
          status: { $set: STATUS.RUNNING }
        }),
      [ActionTypes.GET_WEATHER_SUCCESS]: (state, { payload }) =>
        immutable(state, {
          data: { $set: payload.data },
          status: { $set: STATUS.READY }
        }),
      [ActionTypes.GET_WEATHER_FAILURE]: (state, { payload }) =>
        immutable(state, {
          message: { $set: parseError(payload.message) },
          status: { $set: STATUS.ERROR }
        })
    },
    weatherState
  )
};
