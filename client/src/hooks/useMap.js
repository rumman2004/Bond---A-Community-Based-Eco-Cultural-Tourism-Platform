import { useEffect, useState } from "react";
import mapStore from "../store/mapStore";

export default function useMap() {
  const [state, setState] = useState(mapStore.getState());

  useEffect(() => mapStore.subscribe(setState), []);

  return {
    ...state,
    setCenter: mapStore.setCenter,
    setSelectedLocation: mapStore.setSelectedLocation,
  };
}
