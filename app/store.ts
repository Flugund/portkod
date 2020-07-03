import Vue from "nativescript-vue";
import Vuex from "vuex";
import NSVuexPersistent from "nativescript-vuex-persistent";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { Code, Location, calculateDistance } from "./utils";
import { getJSON, HttpResponse } from "tns-core-modules/http";

Vue.use(Vuex);

const UPDATE_RATE_MS = 5_000;
const MAP_BOX_ACCESS_KEY =
  "pk.eyJ1IjoicG9ydGtvZCIsImEiOiJja2J1dzI5dncwMDdyMnZtdTBxN3o4aDI5In0.cDtrHED5jbAi48u_M7RFiQ";

function distanceToHumanReadble(distance: number): string {
  const ceiledDistanceMeters = Math.ceil(distance);

  return ceiledDistanceMeters > 1000
    ? `${(ceiledDistanceMeters / 1000).toFixed(2)} km`
    : `${ceiledDistanceMeters} m`;
}

export default new Vuex.Store({
  state: {
    codes: [] as Code[], // Should be updated on user input
    currentLocation: {
      longitude: 0,
      latitude: 0,
    } as Location, // Should be updated every locationLoop,
    currentLocationAccuracy: Accuracy.any,
    hasLoadedLocation: false,
  },
  mutations: {
    addCode(state, code: Code) {
      const distanceMeters = calculateDistance(
        state.currentLocation.latitude,
        state.currentLocation.longitude,
        code.latitude,
        code.longitude
      );
      state.codes.push({
        ...code,
        distanceMeters,
        distanceHumanReadable: distanceToHumanReadble(distanceMeters),
      });
    },

    setCurrentLocation(state, location: Location) {
      state.currentLocation.longitude = location.longitude;
      state.currentLocation.latitude = location.latitude;
    },

    setCurrentLocationAccuracy(state, accuracy: number) {
      state.currentLocationAccuracy = accuracy;
    },

    removeCode(state, code) {
      console.log("removeCode", code, state.codes.indexOf(code));

      state.codes.splice(state.codes.indexOf(code), 1);
    },

    updateDistances(state) {
      console.log("updateDistances");

      for (const code of state.codes) {
        const distanceMeters = calculateDistance(
          state.currentLocation.latitude,
          state.currentLocation.longitude,
          code.latitude,
          code.longitude
        );

        code.distanceMeters = distanceMeters;
        code.distanceHumanReadable = distanceToHumanReadble(distanceMeters);
      }
    },

    hasLoadedLocation(state) {
      state.hasLoadedLocation = true;
    },

    setCodeCoordinates(
      _state,
      {
        item,
        longitude,
        latitude,
      }: { item: Code; longitude: number; latitude: number }
    ) {
      item.longitude = longitude;
      item.latitude = latitude;
    },
  },
  actions: {
    async locationLoop(
      { dispatch, commit },
      desiredAccuracy: number = Accuracy.any
    ) {
      await dispatch("getCurrentLocation", desiredAccuracy);

      commit("hasLoadedLocation");

      setTimeout(async () => {
        await dispatch("locationLoop", Accuracy.high);
      }, UPDATE_RATE_MS);
    },

    removeCode({ commit }, code) {
      commit("removeCode", code);
    },

    getCodes({ state }) {
      return state.codes;
    },

    async getLocationFromAddress(
      { state },
      { address }: { address: string; item: Code }
    ) {
      const request = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?proximity=${state.currentLocation.longitude},${
        state.currentLocation.latitude
      }&limit=5&access_token=${MAP_BOX_ACCESS_KEY}`;

      const response = await getJSON<any>(request);

      console.log("mapbox_places response: ", response.features[0].center);
    },

    getCurrentLocation({ commit }, desiredAccuracy: number) {
      return geolocation
        .getCurrentLocation({
          desiredAccuracy,
          maximumAge: 5000,
          timeout: 20000,
        })
        .then((location) => {
          commit("setCurrentLocation", location);

          commit("setCurrentLocationAccuracy", desiredAccuracy);

          commit("updateDistances");

          console.log("updated current location", {
            lat: location.latitude,
            lon: location.longitude,
          });

          return location;
        })
        .catch((err) => {
          console.error("failed to get location", err);

          return undefined;
        });
    },

    async addCode({ commit }, code: Code) {
      console.log("add code", code);

      delete code.new;

      commit("addCode", {
        ...code,
      });
    },
  },
  getters: {
    codes: (state) =>
      state.codes.sort((a, b) => a.distanceMeters - b.distanceMeters),

    closestCode(_state, getters) {
      if (getters.codes.length === 0) {
        return {
          code: "----",
          distanceHumanReadable: undefined,
        };
      }

      const closestCode = getters.codes[0];

      return closestCode;
    },

    currentLocation(state) {
      return state.currentLocation;
    },

    hasLoadedLocation(state) {
      return state.hasLoadedLocation;
    },
  },
  plugins: [NSVuexPersistent(["codes", "currentLocation"])],
});
