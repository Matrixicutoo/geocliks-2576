import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

const AMBER = "#FFB021";
const INK = "#0B0E13";

/**
 * GeoCliks mark — the React Native twin of the web `LogoMark`: an amber wireframe Earth
 * globe (equator, tropics, meridian) with a solid amber location pin standing on it, its
 * head an ink aperture: "geo" + "click". No tile behind it — the globe is the shape.
 * Keep this in sync with packages/web/src/web/components/logo.tsx. See /design.md.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* globe: sphere edge, parallels, meridian */}
      <G stroke={AMBER} strokeWidth={1.6} fill="none">
        <Circle cx={16} cy={16} r={13} />
        <Path d="M3.4 12h25.2M3.4 20h25.2" />
        <Ellipse cx={16} cy={16} rx={5.9} ry={13} />
      </G>
      {/* pin standing on the globe, cut clear of the graticule */}
      <Path
        d="M16 24.6s-5.4-4.8-5.4-8.5a5.4 5.4 0 0 1 10.8 0c0 3.7-5.4 8.5-5.4 8.5Z"
        fill={AMBER}
        stroke={INK}
        strokeWidth={1.5}
      />
      {/* aperture */}
      <Circle cx={16} cy={15.7} r={2} fill={INK} />
    </Svg>
  );
}
