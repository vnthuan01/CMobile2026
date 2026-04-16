"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createNativeBottomTabNavigator;
var _native = require("@react-navigation/native");
var _color = _interopRequireDefault(require("color"));
var _NativeBottomTabView = _interopRequireDefault(require("../views/NativeBottomTabView.js"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
  } = (0, _native.useTheme)();
  const activeTintColor = customActiveTintColor === undefined ? colors.primary : customActiveTintColor;
  const inactiveTintColor = customInactiveTintColor === undefined ? (0, _color.default)(colors.text).mix((0, _color.default)(colors.card), 0.5).hex() : customInactiveTintColor;
  const {
    state,
    descriptors,
    navigation,
    NavigationContent
  } = (0, _native.useNavigationBuilder)(_native.TabRouter, {
    id,
    initialRouteName,
    backBehavior,
    children,
    layout,
    screenListeners,
    screenOptions
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(NavigationContent, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_NativeBottomTabView.default, {
      ...rest,
      tabBarActiveTintColor: activeTintColor,
      tabBarInactiveTintColor: inactiveTintColor,
      state: state,
      navigation: navigation,
      descriptors: descriptors
    })
  });
}
function createNativeBottomTabNavigator(config) {
  return (0, _native.createNavigatorFactory)(NativeBottomTabNavigator)(config);
}
//# sourceMappingURL=createNativeBottomTabNavigator.js.map