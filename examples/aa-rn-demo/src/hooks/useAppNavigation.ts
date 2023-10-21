import { useNavigation, useRoute } from "@react-navigation/native";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Routes,
  type ParamListBase,
  type RouteParams,
  type RouteParamsUnion,
  type ScreenPropsNavigation,
  type ScreenPropsRoute,
} from "types/navigation";

export const useRouteParams = <T extends Routes>(): NonNullable<
  Readonly<RouteParams<T>> | undefined
> => {
  const { params } = useRoute<ScreenPropsRoute<T>>();
  return params as NonNullable<typeof params>;
};

export const useAppNavigation = <T extends Routes>(): {
  navigation: NativeStackNavigationProp<
    ParamListBase<RouteParamsUnion>,
    T,
    undefined
  >;
  params: NonNullable<Readonly<RouteParams<T>> | undefined>;
} => {
  const navigation = useNavigation<ScreenPropsNavigation<T>>();
  const params = useRouteParams<T>();

  return { navigation, params };
};
