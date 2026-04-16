import { type DefaultNavigatorOptions, type NavigatorTypeBagBase, type ParamListBase, type StaticConfig, type TabNavigationState, type TabRouterOptions, type TypedNavigator } from '@react-navigation/native';
import type { NativeBottomTabNavigationConfig, NativeBottomTabNavigationEventMap, NativeBottomTabNavigationOptions, NativeBottomTabNavigationProp } from '../types';
export type NativeBottomTabNavigatorProps = DefaultNavigatorOptions<ParamListBase, string | undefined, TabNavigationState<ParamListBase>, NativeBottomTabNavigationOptions, NativeBottomTabNavigationEventMap, NativeBottomTabNavigationProp<ParamListBase>> & TabRouterOptions & NativeBottomTabNavigationConfig;
declare function NativeBottomTabNavigator({ id, initialRouteName, backBehavior, children, layout, screenListeners, screenOptions, tabBarActiveTintColor: customActiveTintColor, tabBarInactiveTintColor: customInactiveTintColor, ...rest }: NativeBottomTabNavigatorProps): import("react/jsx-runtime").JSX.Element;
export default function createNativeBottomTabNavigator<const ParamList extends ParamListBase, const NavigatorID extends string | undefined = undefined, const TypeBag extends NavigatorTypeBagBase = {
    ParamList: ParamList;
    NavigatorID: NavigatorID;
    State: TabNavigationState<ParamList>;
    ScreenOptions: NativeBottomTabNavigationOptions;
    EventMap: NativeBottomTabNavigationEventMap;
    NavigationList: {
        [RouteName in keyof ParamList]: NativeBottomTabNavigationProp<ParamList, RouteName, NavigatorID>;
    };
    Navigator: typeof NativeBottomTabNavigator;
}, const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>>(config?: Config): TypedNavigator<TypeBag, Config>;
export {};
//# sourceMappingURL=createNativeBottomTabNavigator.d.ts.map