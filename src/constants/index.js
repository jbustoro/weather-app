import keyMirror from "fbjs/lib/keyMirror";

export const ActionTypes = keyMirror({
  GET_WEATHER: undefined,
  GET_WEATHER_SUCCESS: undefined,
  GET_WEATHER_FAILURE: undefined
});

export const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  READY: "ready",
  SUCCESS: "success",
  ERROR: "error"
};
