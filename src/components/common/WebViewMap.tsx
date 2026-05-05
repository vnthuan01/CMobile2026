import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export interface MapMarker {
  id: string;
  coordinate: [number, number]; // [lng, lat]
  color: string;
  size?: number;
  icon?: string;
}

export interface WebViewMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  routeCoordinates?: [number, number][];
  routeColor?: string;
  height?: number;
  style?: object;
  onMarkerPress?: (markerId: string) => void;
}

// ─────────────────────────────────────────────
//  HTML builder
// ─────────────────────────────────────────────

function buildMapHtml(
  goongKey: string,
  center: [number, number],
  zoom: number,
  markers: MapMarker[],
  routeCoordinates: [number, number][],
  routeColor: string,
): string {
  const markersJson = JSON.stringify(markers);
  const routeJson = JSON.stringify(routeCoordinates);
  const hasRoute = routeCoordinates.length >= 2;

  return /* html */ `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link
    href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css"
    rel="stylesheet"
  />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    .maplibregl-ctrl-logo,
    .maplibregl-ctrl-attrib { display: none !important; }
    .custom-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid rgba(255,255,255,0.85);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      transition: transform 0.15s ease;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0,0,0,0.45);
    }
    .custom-marker:hover { transform: scale(1.15); }
    .zoom-controls {
      position: absolute;
      right: 14px;
      bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 2;
    }
    .zoom-btn {
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.96);
      color: #0f172a;
      font-size: 22px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      cursor: pointer;
    }
    .zoom-btn:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="zoom-controls">
    <button id="zoom-in" class="zoom-btn" type="button" aria-label="Zoom in">+</button>
    <button id="zoom-out" class="zoom-btn" type="button" aria-label="Zoom out">-</button>
  </div>
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <script>
    (function () {
      var GOONG_KEY = "${goongKey}";
      var CENTER    = ${JSON.stringify(center)};
      var ZOOM      = ${zoom};
      var MARKERS   = ${markersJson};
      var ROUTE     = ${routeJson};
      var HAS_ROUTE = ${hasRoute};
      var ROUTE_COLOR = "${routeColor}";

      var map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=' + GOONG_KEY,
        center: CENTER,
        zoom: ZOOM,
        attributionControl: false,
        logoPosition: 'bottom-left',
        transformRequest: function (url) {
          if (!url || !GOONG_KEY) return { url: url };

          if (url.indexOf('tiles.goong.io') !== -1 && url.indexOf('api_key=') === -1) {
            var sep = url.indexOf('?') === -1 ? '?' : '&';
            return { url: url + sep + 'api_key=' + GOONG_KEY };
          }

          return { url: url };
        },
      });

      // Remove Mapbox/MapLibre logo & attribution
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      var zoomInBtn = document.getElementById('zoom-in');
      var zoomOutBtn = document.getElementById('zoom-out');

      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function () {
          map.zoomIn({ duration: 220 });
        });
      }

      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function () {
          map.zoomOut({ duration: 220 });
        });
      }

      map.on('load', function () {
        // ── Route layer ──────────────────────────────────────
        if (HAS_ROUTE && ROUTE.length >= 2) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: ROUTE,
              },
            },
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': ROUTE_COLOR,
              'line-width': 4,
              'line-opacity': 0.9,
            },
          });
        }

        // ── Markers ──────────────────────────────────────────
        MARKERS.forEach(function (m) {
          var size = m.size || 16;
          var el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width  = size + 'px';
          el.style.height = size + 'px';
          el.style.backgroundColor = m.color;
          if (m.icon) {
            el.textContent = m.icon;
          }

          el.addEventListener('click', function () {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'markerPress', id: m.id })
              );
            }
          });

          new maplibregl.Marker({ element: el })
            .setLngLat(m.coordinate)
            .addTo(map);
        });

        if (MARKERS.length > 1) {
          var bounds = new maplibregl.LngLatBounds();
          MARKERS.forEach(function (m) {
            bounds.extend(m.coordinate);
          });
          map.fitBounds(bounds, {
            padding: 40,
            maxZoom: 14,
            duration: 0,
          });
        } else if (MARKERS.length === 1) {
          map.flyTo({ center: MARKERS[0].coordinate, zoom: Math.max(ZOOM, 13), duration: 0 });
        }

        // Signal ready
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'mapReady' })
          );
        }
      });

      map.on('error', function (e) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'mapError', message: e.error ? e.error.message : 'Unknown map error' })
          );
        }
      });
    })();
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

const GOONG_KEY =
  process.env.EXPO_PUBLIC_GOONG_MAP_KEY ??
  process.env.EXPO_PUBLIC_GOONG_API_KEY ??
  '';

export default function WebViewMap({
  center,
  zoom = 13,
  markers = [],
  routeCoordinates = [],
  routeColor = '#2E64FE',
  height = 300,
  style,
  onMarkerPress,
}: WebViewMapProps) {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const htmlContent = buildMapHtml(
    GOONG_KEY,
    center,
    zoom,
    markers,
    routeCoordinates,
    routeColor,
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'mapReady') {
          setLoading(false);
          setHasError(false);
        } else if (data.type === 'mapError') {
          setLoading(false);
          setHasError(true);
        } else if (data.type === 'markerPress' && onMarkerPress) {
          onMarkerPress(data.id);
        }
      } catch {
        // non-JSON messages from webview internals — ignore
      }
    },
    [onMarkerPress],
  );

  const handleError = useCallback(() => {
    setLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setHasError(false);
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { height, borderColor: colors.border, backgroundColor: colors.surface },
        style,
      ]}
    >
      {!GOONG_KEY ? (
        <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
          <Ionicons name="map-outline" size={36} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Thiếu khóa bản đồ
          </Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>
            Cần cấu hình `EXPO_PUBLIC_GOONG_MAP_KEY` để hiển thị bản đồ.
          </Text>
        </View>
      ) : null}
      {!hasError && !!GOONG_KEY ? (
        <WebView
          key={retryKey}
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: 'https://tiles.goong.io' }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleMessage}
          onError={handleError}
          onHttpError={handleError}
          // Keep loading indicator separate; mapReady event drives it
          onLoadStart={() => setLoading(true)}
          scrollEnabled={false}
          bounces={false}
          // Allow mixed content on Android (CDN resources)
          mixedContentMode="always"
          // Prevent default WebView context menus
          allowsInlineMediaPlayback
        />
      ) : null}

      {/* Loading overlay */}
      {loading && !hasError && (
        <View
          style={[
            styles.overlay,
            { backgroundColor: colors.surface, pointerEvents: 'none' },
          ]}
        >
          <View style={styles.skeletonFrame}>
            <View
              style={[
                styles.skeletonBlock,
                styles.skeletonMap,
                { backgroundColor: `${colors.primary}12` },
              ]}
            />
            <View
              style={[
                styles.skeletonBlock,
                styles.skeletonLineShort,
                { backgroundColor: `${colors.primary}16` },
              ]}
            />
            <View
              style={[
                styles.skeletonBlock,
                styles.skeletonLineLong,
                { backgroundColor: `${colors.primary}10` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
          <Ionicons name="warning-outline" size={36} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Không thể tải bản đồ
          </Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>
            Kiểm tra kết nối mạng và thử lại.
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  skeletonFrame: {
    width: '82%',
    alignItems: 'center',
  },
  skeletonBlock: {
    borderRadius: 14,
  },
  skeletonMap: {
    width: '100%',
    height: 120,
  },
  skeletonLineShort: {
    width: '46%',
    height: 14,
    marginTop: 16,
  },
  skeletonLineLong: {
    width: '72%',
    height: 12,
    marginTop: 10,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
