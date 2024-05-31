import { h } from "vue";
import Theme from "vitepress/theme";
import VideoEmbed from "./components/VideoEmbed.vue"; // Importing the component
import "./style.css";

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component("VideoEmbed", VideoEmbed); // Registering the component globally
    // ...
  },
};
