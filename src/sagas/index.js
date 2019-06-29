import { all, call, put, takeLatest } from "redux-saga/effects";
import { ActionTypes } from "../constants";
import { request } from "../modules/client";

/** Open Weather Map
 *
 * Api Call 5 day / 3 hour forecast data
 * https://api.openweathermap.org/data/2.5/forecast?q={city name},{country code}&appid={api key}
 *
 */

const API_KEY = "YOUR_API_KEY";

export function* getWeather({ payload }) {
  try {
    const response = yield call(
      request,
      `http://api.openweathermap.org/data/2.5/forecast?q=${
        payload.query
      }&appid=${API_KEY}`
    );
    yield put({
      type: ActionTypes.GET_WEATHER_SUCCESS,
      payload: { data: response }
    });
  } catch (err) {
    yield put({
      type: ActionTypes.GET_WEATHER_FAILURE,
      payload: err
    });
  }
}

export default function* root() {
  yield all([takeLatest(ActionTypes.GET_WEATHER, getWeather)]);
}
