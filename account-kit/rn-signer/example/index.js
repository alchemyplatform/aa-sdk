import { AppRegistry } from "react-native";
// eslint-disable-next-line import/extensions
import App from "./src/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
