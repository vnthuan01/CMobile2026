TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG REACT NATIVE
TỔNG QUAN
Map SDK trong React Native cho phép bạn tích hợp bản đồ vào ứng dụng di động của mình. Có nhiều plugin khác nhau và những plugin này hỗ trợ tùy chỉnh bản đồ, phong cách và xử lý sự kiện liên quan.

Goong Maps React Native cung cấp Map SDK cho cả thiết bị Android và iOS, cho phép tùy chỉnh bản đồ với nội dung để hiển thị trên các thiết bị di động.
Goong Maps Plugin dựa trên cơ chế của React Native để bổ sung các màn hình hiển thị cho Android và iOS.

Tài liệu dưới đây trình bày cách tích hợp Mapbox trên nền bản đồ của Goong và sử dụng các dịch vụ cơ bản, bao gồm:

Hiện các kiểu bản đồ: Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
Tìm kiếm: Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
Dẫn đường: Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đồ, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).
CÁCH TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG REACT NATIVE
Các tham số cần thiết
Cần có:

Map Key, API Key: vào trang đăng ký tài khoản và tạo key, xem hướng dẫn đăng ký tài khoản và tạo key tại đây.
Gán Mapbox
Vào https://account.mapbox.com/ để đăng ký tài khoản Mapbox để cấp MAPBOX_DOWNLOADS_TOKEN.
Sau khi đăng ký tài khoản bạn vào mục “Token”:


Tiếp sau đó chọn “Create token”:


Bạn chọn theo mẫu sau:


Lưu ý: Bắt buộc phải chọn “DOWNLOADS:READ”

Ấn “Create Token” để tạo token.
Lưu ý: Token sẽ có dạng sk. …

Tiếp theo vào mở “Terminal” copy nội dung dưới đây vào để add package:
yarn add @rnmapbox/maps
Cấu hình Android
android/build.gradle:
Thêm phần sau vào “android/build.gradle” của bạn, vào phần “allprojects/repositories// android/build.gradle”.

allprojects {
    repositories {
        // Configure the Maven repository for Mapbox
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication {
                basic(BasicAuthentication) // Use basic authentication for the repository
            }
            credentials {
                // Do not change the username below.
                // This should always be `mapbox` (not your username).
                username = 'mapbox' // Static username for Mapbox repository
                
                // Use the secret token stored in gradle.properties as the password
                password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: "" // Default to empty string if not set
            }
        }
    }
}
gradle.properties:
Xác minh “MAPBOX_DOWNLOADS_TOKEN” trong “gradle.properties”.

/Users/foo/.gradle/gradle.properties:MAPBOX_DOWNLOADS_TOKEN=sk.ey...
rnmapbox v11
“@rnmapbox 10.1” hỗ trợ cả phiên bản “10.16.*” và “11.0.*” nhưng mặc định là “10.16.*”. Để sử dụng “11.0.*” vui lòng đặt cấu hình theo nền tảng của bạn:

Đặt RNMapboxMapsVersion:
Trong “android/build.gradle” → “buildscript” → “ect”:

buildscript {
       ext {
  // highlight-start
             RNMapboxMapsVersion = '11.0.0'
  // highlight-end
         }
}
Cấu hình quyền truy cập vị trí:
android/app/src/main/AndroidManifest.xml

<manifest ... >
// highlight-start
     <!-- Always include this permission -->
     <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
     <!-- Include only if your app benefits from precise location access. -->
     <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
// highlight-end
</manifest>
Cấu hình iOS
Ios/Podfile:
Thêm phần sau vào “ios/Podfile” của bạn:

# highlight-start
pre_install do |installer|
  $RNMapboxMaps.pre_install(installer)
end
# highlight-end

post_install do |installer|
  # highlight-start
  $RNMapboxMaps.post_install(installer)
  # highlight-end

  # ... other post install hooks
end
  Xác minh “.netrc”:
machine api.mapbox.com
login mapbox
password sk.ey...
rnmapbox v11:
Thêm phần sau vào “ios/Podfile” của bạn:

$RNMapboxMapsVersion = '= 11.0.0'
Vì Mapbox Maps 11 yêu cầu iOS 12.4 trở lên nên bạn có thể cần cập nhật dòng mục tiêu triển khai trong “ios/Podfile” của mình:

platform :ios, '12.4' # change to minimum 12.4
Cấu hình quyền truy cập vị trí:
Nếu bạn muốn hiển thị vị trí trên bản đồ với thành phần “LocationPuck”, bạn sẽ cần thêm thuộc tính sau vào:

Info.plist của mình <key>NSLocationWhenInUseUsageDescription</key> <string>Show current location on map.</string>
Để sử dụng Mapbox vào React Native bạn cần:

import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken("<YOUR_ACCESSTOKEN>");
Mapbox.setConnected(true);

componentDidMount() {
    Mapbox.setTelemetryEnabled(false);
}
Hiển thị bản đồ:
const App = () => {
  const [loadMap] = useState("https://tiles.goong.io/assets/goong_map_web.json?api_key=\(GoongConstants.API_KEY)"); 
  /* Sử dụng Load Map */ // Kiểu URL cho bản đồ
  const [coordinates] = useState([105.83991, 21.028]); // Vị trí mà bản đồ nên căn giữa. [lng, lat]
  const camera = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView
        styleURL={loadMap}
        onPress={handleOnPress}
        style={{ flex: 1 }}
        projection="globe" // Phép chiếu được sử dụng khi hiển thị bản đồ
        zoomEnabled={true}
      >
        <MapboxGL.Camera
          ref={camera}
          zoomLevel={6} // Mức thu phóng của bản đồ
          centerCoordinate={coordinates}
        />
      </MapboxGL.MapView>
    </View>
  );
};
Trường hợp muốn thêm bản đồ ít icon:
https://tiles.goong.io/assets/goong_map_highlight.jsonapi_key=\(GoongConstants.API_KEY)
Trường hợp muốn thêm bản đồ vệ tinh:
https://tiles.goong.io/assets/goong_satellite.json?api_key=\(GoongConstants.API_KEY)
Bỏ logo của Mapbox:
mapView.logoView.isHidden = true
Thêm marker vào bản đồ:
<MapboxGL.MapView
  styleURL={loadMap} // Đường dẫn đến style bản đồ
  style={{ flex: 1 }} // Đặt kích thước cho bản đồ
>
  {locations.map((item, index) => (
    <MapboxGL.PointAnnotation
      id={`pointID-${index}`} // ID duy nhất cho mỗi điểm chú thích
      key={`pointKey-${index}`} // Khóa duy nhất cho mỗi điểm chú thích
      coordinate={item.coord} // Tọa độ của điểm hiển thị
      draggable={true} // Cho phép kéo điểm chú thích
    >
      {/* Bạn có thể thêm hình ảnh hoặc biểu tượng vào đây */}
      <MapboxGL.Callout title={`Point ${index + 1}`} />
    </MapboxGL.PointAnnotation>
  ))}
</MapboxGL.MapView>
Trong hàm trên thực hiện 2 việc: gắn marker lên bản đồ, vẽ vòng tròn.

Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude.

Tìm kiếm địa điểm
Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn.

Xử lý gọi Autocomplete API:
const getPlacesAutocomplete = async () => {
    if (search.trim() === '') {
      setDescription([]); // Xóa gợi ý nếu không có đầu vào
      return;
    }

    try {
      let autoComplete = await MapAPI.getPlacesAutocomplete({
        search: encodeURIComponent(search),
      });
      setDescription(autoComplete.predictions);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
};
Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ Autocomplete của Goong để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là place_id. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ Place Detail bằng tham số place_id, thì sẽ lấy được tọa độ của điểm này.

Gọi Place Detail API:
const _handleSubmit = async (item) => {
  let placeDetail = await MapAPI.getPlaceDetail({
    place_id: item.item.place_id,
  });  
  setLocations([
    placeDetail.result.geometry.location.lng,
    placeDetail.result.geometry.location.lat,
  ]);
  
  setZoomlevel(14);
};
Với tọa độ của điểm mà người dùng đã chọn, ta sẽ gán marker và view camera:
<MapLibreGL.PointAnnotation
  id="pointDirect"
  key="keyID"
  draggable={true}
  coordinate={currentLocation} // Tọa độ marker 1
/>

{locations.length > 0 ? (
  <MapLibreGL.PointAnnotation
    id="marker1"
    coordinate={locations} // Tọa độ marker 1
  />
) : null}
Lưu ý: Số lần gọi AutoComplete thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì Goong sẽ tính phí mỗi lần gọi AutoComplete này.

Dẫn đường
Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,…

Sau khi khách hàng nhập tọa độ điểm đầu và cuối, gọi dịch vụ Directions của bên Goong sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

Hàm getDirections gọi dịch vụ của Goong:
const getDirections = async () => {
  const direction = await MapAPi.getDirections({
    vehicle: 'car',
    origin: currentLocation,
    destination: locations,
  });

  const decodePolyline = (encoded) => {
    const decoded = polyline.decode(encoded);
    return decoded.map(point => ({
      latitude: point[0],
      longitude: point[1],
    }));
  };

  const coordinates = decodePolyline(
    direction.routes[0].overview_polyline.points,
  );

  setRoute(coordinates);
};
Hàm này sẽ gọi dịch vụ Directions của Goong, bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car) và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

Hiển thị đường đó lên bản đồ:
<MapLibreGL.ShapeSource
  id="lineSource"
  shape={{
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: route.map(coord => [
        coord.longitude,
        coord.latitude,
      ]),
    },
  }}
>
  <MapLibreGL.LineLayer
    id="lineLayer"
    style={{
      lineColor: '#2E64FE',
      lineWidth: 10,
      lineCap: 'round', // Thêm thuộc tính lineCap
      lineJoin: 'round', // Thêm thuộc tính lineJoin
    }}
  />
</MapLibreGL.ShapeSource>