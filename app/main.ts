import Vue from "nativescript-vue";
import VueDevtools from "nativescript-vue-devtools";

if (TNS_ENV !== "production") {
  Vue.use(VueDevtools);
}
import store from "./store";

import App from "./components/App";

import { MapboxView } from "nativescript-mapbox";

Vue.registerElement("Mapbox", () => MapboxView);

import { TNSFontIcon, fonticon } from "nativescript-fonticon";

TNSFontIcon.debug = true;
TNSFontIcon.paths = {
  mdi: "material-design-icons.css",
};
TNSFontIcon.loadCss();

Vue.filter("fonticon", fonticon);

import FontIcon from "./components/FontIcon.vue";

Vue.component(FontIcon.name, FontIcon);

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = TNS_ENV === "production";

new Vue({
  store,
  render: (h) => h("frame", [h(App)]),
}).$start();
