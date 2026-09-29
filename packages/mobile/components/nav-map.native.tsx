import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_STYLE_NAV } from "@/components/map-style";
import type { NavMapHandle, NavMapProps } from "@/components/nav-map";

/** How far ahead the camera sits, and how hard it leans over. A junction reads better pitched. */
const CAMERA_PITCH = 45;
const CAMERA_ZOOM = 17;
const CAMERA_EASE_MS = 800;

/**
 * The driving map itself. It lives behind the imperative handle in ./nav-map so the navigate
 * screen never imports react-native-maps directly — that library is native-only, and reaching
 * it from a shared import takes the whole web bundle down with it.
 */
const NavMap = forwardRef<NavMapHandle, NavMapProps>(function NavMap(
  { pin, path, dashed, markerTitle, strokeColor, onPanDrag },
  ref,
) {
  const map = useRef<MapView | null>(null);

  useImperativeHandle(ref, () => ({
    follow(fix) {
      map.current?.animateCamera(
        {
          center: { latitude: fix.lat, longitude: fix.lng },
          heading: fix.heading ?? 0,
          pitch: CAMERA_PITCH,
          zoom: CAMERA_ZOOM,
        },
        { duration: CAMERA_EASE_MS },
      );
    },
  }));

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      customMapStyle={MAP_STYLE_NAV}
      initialRegion={
        pin
          ? {
              latitude: pin.lat,
              longitude: pin.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }
          : undefined
      }
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      // Any hand on the map means he wants to look somewhere else. The FOLLOW button gives the
      // camera back.
      onPanDrag={onPanDrag}
    >
      {path.length > 1 ? (
        <Polyline
          coordinates={path.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor={strokeColor}
          strokeWidth={6}
          // A straight-line fallback is drawn dashed, so it never passes itself off as a road.
          lineDashPattern={dashed ? [10, 8] : undefined}
          lineCap="round"
        />
      ) : null}
      {pin ? (
        <Marker
          coordinate={{ latitude: pin.lat, longitude: pin.lng }}
          title={markerTitle ?? undefined}
          pinColor={strokeColor}
        />
      ) : null}
    </MapView>
  );
});

export default NavMap;
