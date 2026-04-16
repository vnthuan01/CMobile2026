"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = NativeBottomTabView;
var _native = require("@react-navigation/native");
var _reactNativeBottomTabs = _interopRequireDefault(require("react-native-bottom-tabs"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function NativeBottomTabView({
  state,
  navigation,
  descriptors,
  tabBar,
  ...rest
}) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeBottomTabs.default, {
    ...rest,
    navigationState: state,
    renderScene: ({
      route
    }) => descriptors[route.key]?.render(),
    getActiveTintColor: ({
      route
    }) => {
      return descriptors[route.key]?.options.tabBarActiveTintColor;
    },
    getLabelText: ({
      route
    }) => {
      const options = descriptors[route.key]?.options;
      return options?.tabBarLabel !== undefined ? options.tabBarLabel : options?.title !== undefined ? options.title : route.name;
    },
    getBadge: ({
      route
    }) => descriptors[route.key]?.options.tabBarBadge,
    getBadgeBackgroundColor: ({
      route
    }) => descriptors[route.key]?.options.tabBarBadgeBackgroundColor,
    getBadgeTextColor: ({
      route
    }) => descriptors[route.key]?.options.tabBarBadgeTextColor,
    getHidden: ({
      route
    }) => {
      const options = descriptors[route.key]?.options;
      return options?.tabBarItemHidden === true;
    },
    getTestID: ({
      route
    }) => descriptors[route.key]?.options.tabBarButtonTestID,
    getRole: ({
      route
    }) => descriptors[route.key]?.options.role,
    tabBar: tabBar ? () => tabBar({
      state,
      descriptors,
      navigation
    }) : undefined,
    getIcon: ({
      route,
      focused
    }) => {
      const options = descriptors[route.key]?.options;
      if (options?.tabBarIcon) {
        const {
          tabBarIcon
        } = options;
        return tabBarIcon({
          focused
        });
      }
      return null;
    },
    getLazy: ({
      route
    }) => descriptors[route.key]?.options.lazy ?? true,
    getFreezeOnBlur: ({
      route
    }) => descriptors[route.key]?.options.freezeOnBlur,
    getSceneStyle: ({
      route
    }) => descriptors[route.key]?.options.sceneStyle,
    onTabLongPress: index => {
      const route = state.routes[index];
      if (!route) {
        return;
      }
      navigation.emit({
        type: 'tabLongPress',
        target: route.key
      });
    },
    getPreventsDefault: ({
      route
    }) => descriptors[route.key]?.options.preventsDefault,
    onIndexChange: index => {
      const focused = index === state.index;
      const route = state.routes[index];
      if (!route) {
        return;
      }
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true
      });
      if (focused || event.defaultPrevented || descriptors[route.key]?.options.preventsDefault) {
        return;
      } else {
        navigation.dispatch({
          ..._native.CommonActions.navigate(route),
          target: state.key
        });
      }
    }
  });
}
//# sourceMappingURL=NativeBottomTabView.js.map