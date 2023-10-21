/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type RootTabParamList = {};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

// eslint-disable-next-line @typescript-eslint/ban-types
export type HomeTabParamList = {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ProfileTabParamList = {};

export type NominalType<T extends string> = { __type: T };

export type unixTime = string & NominalType<"unixTime">;

export type ItemListType<T = string> = {
  label: string;
  value: T;
}[];

export type TrueOrErrReturn<T = string> =
  | { success: true; value: T }
  | { success: false; errMsg: string };

export type ActionStartEndCallback = {
  start?: () => void;
  end?: () => void;
};

declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
