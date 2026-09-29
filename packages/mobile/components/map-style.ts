import type { MapStyleElement } from "react-native-maps";

/**
 * The map palette for driving.
 *
 * Deliberately not the evidence-map style in field-map.native.tsx. That one is built to be read
 * at a standstill: pins, labels, parcel lines, everything the office might want. This one is
 * read at 50 km/h through a windscreen, so it throws away everything that is not the road —
 * businesses, transit, parks, parcel numbers — and keeps the street names and the motorway
 * colours that tell a driver which lane he wants. The amber route line is the brightest thing
 * on it, which is the whole point.
 */
export const MAP_STYLE_NAV: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#EEF1F6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4A5564" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#D5DBE4" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E1EBE0" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#E7EBF1" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#C9DEF2" }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
  // Roads, loudest of anything left. Motorways carry their own warm fill so a junction reads
  // as a junction at a glance.
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#DCE2EA" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#59636F" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#FFE2AE" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#EFC076" }] },
  { featureType: "road.highway", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "on" }] },
];
