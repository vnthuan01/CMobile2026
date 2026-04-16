"use strict";

import { createNavigatorFactory, TabRouter, useNavigationBuilder, useTheme } from '@react-navigation/native';
import Color from 'color';
import NativeBottomTabView from "../views/NativeBottomTabView.js";
import { jsx as _jsx } from "react/jsx-runtime";
function NativeBottomTabNavigator({
  id,
  initialRouteName,
  backBehavior,
  children,
  layout,
  screenListeners,
  screenOptions,
  tabBarActiveTintColor: customActiveTintColor,
  tabBarInactiveTintColor: customInactiveTintColor,
  ...rest
}) {
  const {
    colors
  } = useTheme();
  const activeTintColor = customActiveTintColor === undefined ? colors.primary : customActiveTintColor;
  const inactiveTintColor = customInactiveTintColor === undefined ? Color(colors.text).mix(Color(colors.card), 0.5).hex() : customInactiveTintColor;
  const {
    state,
    descriptors,
    navigation,
    NavigationContent
  } = useNavigationBuilder(TabRouter, {
    id,
    initialRouteName,
    backBehavior,
    children,
    layout,
    screenListeners,
    screenOptions
  });
  return /*#__PURE__*/_jsx(NavigationContent, {
    children: /*#__PURE__*/_jsx(NativeBottomTabView, {
      ...rest,
      tabBarActiveTintColor: activeTintColor,
      tabBarInactiveTintColor: inactiveTintColor,
      state: state,
      navigation: navigation,
      descriptors: descriptors
    })
  });
}
export default function createNativeBottomTabNavigator(config) {
  return createNavigatorFactory(NativeBottomTabNavigator)(config);
}
//# sourceMappingURL=createNativeBottomTabNavigator.js.map