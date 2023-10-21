/**
 * @format
 */

// from rn-nodeify
import "./shim";

import "fastestsmallesttextencoderdecoder";

// for uuid (& web3 if you plan to use it)
import "react-native-get-random-values";

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
