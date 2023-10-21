import {
  StackActions,
  createNavigationContainerRef,
  type Route,
} from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type OwnedNft } from "alchemy-sdk";
export enum Routes {
  Main = "Main",
  Tab = "Tab",
  Auth = "Auth",
  Login = "Login",
  Home = "Home",
  Profile = "Profile",
  Setting = "Setting",
  Detail = "Detail",
}

type TabRouteParamsUnion = {
  route: Routes.Tab;
  params: undefined;
};

type AuthRouteParamsUnion = {
  route: Routes.Login;
  params: undefined;
};

type MainRouteParamsUnion =
  | {
      route: Routes.Home;
      params: undefined;
    }
  | {
      route: Routes.Profile;
      params: undefined;
    }
  | {
      route: Routes.Setting;
      params: undefined;
    }
  | {
      route: Routes.Detail;
      params: { item: OwnedNft };
    };

export type RouteParamsUnion =
  | {
      route: Routes.Main;
      params: undefined;
    }
  | {
      route: Routes.Auth;
      params: undefined;
    }
  | AuthRouteParamsUnion
  | MainRouteParamsUnion
  | TabRouteParamsUnion;

type ExtractParams<R extends Routes, U extends RouteParamsUnion> = U extends {
  route: R;
  params: infer P;
}
  ? P
  : never;
// type ExtractNavigatorParams<R extends Routes[]> = { [key in R[number]]: ExtractParams<key, RouteParamsUnion> };
export type RouteParams<R extends Routes> = ExtractParams<R, RouteParamsUnion>;
export type ParamListBase<T extends RouteParamsUnion = RouteParamsUnion> = {
  [k in T["route"]]: T extends { route: k; params: infer P } ? P : never;
};

export type RouteProps<
  T extends Routes,
  P extends Record<string, unknown> = Record<string, string>,
> = {
  navigation: NativeStackNavigationProp<ParamListBase, T>;
  route: Route<T, RouteParams<T>>;
} & P;

export type ScreenPropsNavigation<T extends Routes> =
  RouteProps<T>["navigation"];
export type ScreenPropsRoute<T extends Routes> = RouteProps<T>["route"];

export const navigationRef = createNavigationContainerRef<ParamListBase>();
export const navigationActions = {
  navigate<T extends Routes>(name: T, params: RouteParams<T>): void {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name === name) {
        // navigationRef.setParams(params);
        navigationRef.dispatch(StackActions.replace(name, params));
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigationRef.navigate<Routes>(name, params);
      }
    }
  },
  push<T extends Routes>(name: T, params: RouteParams<T>): void {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },
  goBack(): void {
    if (navigationRef.isReady()) {
      navigationRef.goBack();
    }
  },
};
