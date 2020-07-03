<template>
  <Page>
    <ActionBar>
      <ActionItem
        @tap="addCodeModal"
        ios.systemIcon="4"
        ios.position="right"
        android.systemIcon="ic_menu_add"
        android.position="actionBar"
      />
    </ActionBar>
    <TabView
      tabTextColor="rgba(224, 58, 63, 0.5)"
      selectedTabTextColor="rgb(224, 58, 63)"
    >
      <TabViewItem title="Nära">
        <GridLayout columns="*" rows="2*, 1*">
          <Label class="message" :text="closestCode.code" col="0" row="0" />
          <StackLayout col="0" row="1">
            <Label
              v-if="closestCode.description !== undefined"
              class="description"
              :text="closestCode.description"
            />
            <Label
              v-if="closestCode.distanceHumanReadable !== undefined"
              class="distance"
              :text="closestCode.distanceHumanReadable"
            />
          </StackLayout>
        </GridLayout>
      </TabViewItem>
      <TabViewItem title="Alla">
        <StackLayout>
          <ListView
            for="code in codes"
            height="100%"
            ref="listView"
            @itemTap="onItemTap"
          >
            <v-template>
              <!-- Shows the list item label in the default color and style. -->
              <Label class="list-item" :text="code.description || code.code" />
            </v-template>
          </ListView>
        </StackLayout>
      </TabViewItem>
    </TabView>
  </Page>
</template>

<script lang="ts">
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { mapGetters, mapActions, mapState } from "vuex";
import { calculateDistance } from "../utils";
import CodeDetails from "./CodeDetails.vue";
import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";
import { Font } from "tns-core-modules/ui/styling/font";
import { getImage } from "nativescript-vector-icons";

const iconFont: Font = Font.default
  .withFontFamily("Material Icons, MaterialIcons-Regular")
  .withFontSize(32);

export default {
  async mounted() {
    console.log("mounted");

    // You must run it once application is initiated
    app.ios.window.backgroundColor = new Color("black").ios;

    await geolocation.enableLocationRequest();

    this.$store.dispatch("locationLoop");
  },

  data: () => ({
    searchString: "",
  }),

  computed: {
    ...mapGetters(["codes", "closestCode", "currentLocation"]),

    listIcon: () => {
      return getImage(iconFont, String.fromCharCode(63615), new Color("black"));
    },
    pinIcon: () => {
      return getImage(iconFont, String.fromCharCode(63615), new Color("black"));
    },
  },

  methods: {
    ...mapActions([
      "removeCode",
      "getCurrentLocation",
      "sortCodes",
      "getCodes",
    ]),

    onItemTap(event) {
      this.$showModal(CodeDetails, { props: { item: event.item } });
    },

    async addCodeModal() {
      this.$showModal(CodeDetails, {
        props: {
          item: {
            new: true,
            code: "",
            description: "",
            address: "",
            latitude: this.currentLocation.latitude,
            longitude: this.currentLocation.longitude,
          },
        },
      });
    },
  },
};
</script>

<style scoped>
ActionBar {
  color: #fff;
  background-color: rgb(224, 58, 63);
}

.list-item {
  text-align: center;
  font-size: 20;
  padding: 20;
}
</style>
