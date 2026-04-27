import { DEFAULT_CENTER } from "../services/mapService";

let state = {
  center: DEFAULT_CENTER,
  zoom: 8,
  selectedLocation: null,
};

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener(state));

const mapStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setCenter(center) {
    state = { ...state, center };
    notify();
  },
  setSelectedLocation(location) {
    state = { ...state, selectedLocation: location };
    notify();
  },
};

export default mapStore;
