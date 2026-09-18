import {
  Accessibility,
  Banknote,
  Info,
  Shirt,
  Store,
  Utensils,
  Brush,
  Gem,
  Smartphone,
  Landmark,
  Footprints,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { MapPlace } from "./explorer-model";

export function PlaceIcon({
  place,
  size = 20,
}: {
  place: MapPlace;
  size?: number;
}) {
  const referenceIcon =
    place.id === "ref-scotiabank"
      ? Landmark
      : ["ref-fossil", "ref-peoples", "ref-michael-hill"].includes(place.id)
        ? Gem
        : ["ref-foot-locker", "ref-kids-footlocker", "ref-spring"].includes(
              place.id,
            )
          ? Footprints
          : place.id === "ref-stitch-it"
            ? Star
            : place.categoryId === "beauty"
              ? Brush
              : place.categoryId === "electronics"
                ? Smartphone
                : [
                      "ref-chanel",
                      "ref-marciano",
                      "ref-attrattivo",
                      "ref-soft-moc",
                    ].includes(place.id)
                  ? ShoppingBag
                  : null;
  if (referenceIcon) {
    const Icon = referenceIcon;
    return <Icon size={size} aria-hidden="true" />;
  }
  const Icon =
    place.category === "ATM"
      ? Banknote
      : place.category === "Information"
        ? Info
        : place.kind === "poi"
          ? Accessibility
          : place.categoryId === "fashion"
            ? Shirt
            : place.categoryId === "dining"
              ? Utensils
              : Store;
  return <Icon size={size} aria-hidden="true" />;
}
