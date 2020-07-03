<template>
  <Frame>
    <Page>
      <ActionBar title="Portkod">
        <ActionItem
          @tap="save()"
          ios.systemIcon="3"
          ios.position="right"
          android.systemIcon="ic_menu_save"
          android.position="actionBar"
        />
      </ActionBar>

      <FlexboxLayout flexDirection="column" backgroundColor="white">
        <StackLayout height="45%" style="margin: 10">
          <Label class="label" text="Kod" />
          <TextField v-model="item.code" autocorrect="false" />
          <Label class="label" text="Beskrivning" />
          <TextField v-model="item.description" autocorrect="false" />
          <Label class="label" text="Adress" />
          <TextField v-model="item.address" autocorrect="false" />
        </StackLayout>

        <GridLayout :height="item.new ? '55%' : '45%'">
          <Mapbox
            :accessToken="mapBoxAccessKey"
            mapStyle="traffic_day"
            :latitude="item.latitude"
            :longitude="item.longitude"
            hideCompass="true"
            zoomLevel="12"
            :showUserLocation="this.hasLoadedLocation"
            disableZoom="false"
            disableRotation="false"
            disableScroll="false"
            disableTilt="true"
            @mapReady="onMapReady($event)"
          >
          </Mapbox>
        </GridLayout>

        <FlexboxLayout height="10%" v-if="!item.new">
          <Button
            class="btn btn-outline"
            width="50%"
            text="Ta bort"
            @tap="removeCodePopup"
          />
          <Button
            class="btn btn-outline"
            width="50%"
            text="Dela"
            @tap="shareCode"
          />
        </FlexboxLayout>
      </FlexboxLayout>
    </Page>
  </Frame>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import * as SocialShare from "nativescript-social-share";

export default {
  data: () => ({
    mapBoxAccessKey:
      "pk.eyJ1IjoicG9ydGtvZCIsImEiOiJja2J1dzI5dncwMDdyMnZtdTBxN3o4aDI5In0.cDtrHED5jbAi48u_M7RFiQ",
  }),

  props: ["item"],

  computed: {
    ...mapGetters(["hasLoadedLocation"]),
  },

  watch: {
    "item.code": (val) => {
      console.log("Item code: " + val);
    },
    "item.address": function(val, oldVal) {
      console.log("Item Address: " + val);

      this.getLocationFromAddress({ address: val, item: this.item });
    },
  },

  methods: {
    ...mapActions(["removeCode", "addCode", "getLocationFromAddress"]),

    onMapReady(args) {
      args.map.addMarkers([
        {
          lat: this.item.latitude,
          lng: this.item.longitude,
          title: this.item.code,
          subtitle: this.item.description,
        },
      ]);
    },

    async save() {
      if (this.item.new) {
        await this.addCode(this.item);
      }

      this.$modal.close();
    },

    async removeCodePopup() {
      const response = await confirm({
        title: "Bekräfta",
        message: "Är du säker?",
        okButtonText: "OK",
        cancelButtonText: "Avbryt",
      });

      if (response) {
        this.removeCode(this.item);

        this.$modal.close();
      }
    },

    shareCode() {
      SocialShare.shareUrl(
        "portkod://portkod.app/",
        `Här är portkoden: ${this.item.code}`,
        "Hur vill du dela?"
      );
    },
  },
};
</script>

<style scoped>
ActionBar {
  color: #fff;
  background-color: rgb(224, 58, 63);
}

button {
  color: rgb(224, 58, 63);
}

frame {
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
}

TextField {
  font-size: 18;
  margin-bottom: 8;
}

.label {
  font-size: 12;
  margin-left: 10;
  margin-top: 10;
}

.disabled {
  color: rgba(0, 0, 0, 0.5);
}
</style>
