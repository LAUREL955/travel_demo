import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Destination, Route, UserLocation, Sticker } from '../../types';

interface UserPreferences {
  attractionTypes: string[];
  transportation: string[];
  cuisine: string[];
  shopping: string[];
  physicalLevel: 'low' | 'medium' | 'high';
  budget: 'economy' | 'comfort' | 'luxury';
}

interface HistoryBehavior {
  viewedAttractions: string[];
  selectedAttractions: string[];
  completedTrips: string[];
  searchHistory: string[];
}

interface ParsedData {
  destination?: string;
  duration?: number;
  preferences?: string[];
  budget?: string;
  travelStyle?: string;
}

interface RouteState {
  destinations: Destination[];
  currentRoute: Route | null;
  userLocation: UserLocation | null;
  stickers: Sticker[];
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  searchQuery: string;
  showSettings: boolean;
  selectedColor: string;
  userPreferences: UserPreferences | null;
  historyBehavior: HistoryBehavior;
  parsedInputData: ParsedData | null;
  showNaturalLanguageInput: boolean;
  showPreferenceSettings: boolean;
  showPersonalizedItinerary: boolean;
  routeHistory: Route[];
  showRouteHistory: boolean;
  isAuthenticated: boolean;
  user: any | null;
  showAuth: boolean;
}

const initialState: RouteState = {
  destinations: [],
  currentRoute: null,
  userLocation: null,
  stickers: [],
  isLoading: false,
  error: null,
  theme: 'light',
  searchQuery: '',
  showSettings: false,
  selectedColor: '#3B82F6',
  userPreferences: null,
  historyBehavior: {
    viewedAttractions: [],
    selectedAttractions: [],
    completedTrips: [],
    searchHistory: []
  },
  parsedInputData: null,
  showNaturalLanguageInput: false,
  showPreferenceSettings: false,
  showPersonalizedItinerary: false,
  routeHistory: [],
  showRouteHistory: false,
  isAuthenticated: false,
  user: null,
  showAuth: true,
};

export const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    addDestination: (state, action: PayloadAction<Destination>) => {
      state.destinations.push(action.payload);
    },
    removeDestination: (state, action: PayloadAction<string>) => {
      state.destinations = state.destinations.filter(dest => dest.id !== action.payload);
    },
    updateDestination: (state, action: PayloadAction<Destination>) => {
      const index = state.destinations.findIndex(dest => dest.id === action.payload.id);
      if (index !== -1) {
        state.destinations[index] = action.payload;
      }
    },
    setUserLocation: (state, action: PayloadAction<UserLocation>) => {
      state.userLocation = action.payload;
    },
    setCurrentRoute: (state, action: PayloadAction<Route>) => {
      state.currentRoute = action.payload;
    },
    setStickers: (state, action: PayloadAction<Sticker[]>) => {
      state.stickers = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setShowSettings: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },
    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.userPreferences = action.payload;
    },
    addViewedAttraction: (state, action: PayloadAction<string>) => {
      if (!state.historyBehavior.viewedAttractions.includes(action.payload)) {
        state.historyBehavior.viewedAttractions.push(action.payload);
      }
    },
    addSelectedAttraction: (state, action: PayloadAction<string>) => {
      if (!state.historyBehavior.selectedAttractions.includes(action.payload)) {
        state.historyBehavior.selectedAttractions.push(action.payload);
      }
    },
    addCompletedTrip: (state, action: PayloadAction<string>) => {
      if (!state.historyBehavior.completedTrips.includes(action.payload)) {
        state.historyBehavior.completedTrips.push(action.payload);
      }
    },
    addSearchHistory: (state, action: PayloadAction<string>) => {
      state.historyBehavior.searchHistory.unshift(action.payload);
      if (state.historyBehavior.searchHistory.length > 20) {
        state.historyBehavior.searchHistory.pop();
      }
    },
    setParsedInputData: (state, action: PayloadAction<ParsedData>) => {
      state.parsedInputData = action.payload;
    },
    setShowNaturalLanguageInput: (state, action: PayloadAction<boolean>) => {
      state.showNaturalLanguageInput = action.payload;
    },
    setShowPreferenceSettings: (state, action: PayloadAction<boolean>) => {
      state.showPreferenceSettings = action.payload;
    },
    setShowPersonalizedItinerary: (state, action: PayloadAction<boolean>) => {
      state.showPersonalizedItinerary = action.payload;
    },
    addRouteToHistory: (state, action: PayloadAction<Route>) => {
      state.routeHistory.unshift(action.payload);
      if (state.routeHistory.length > 10) {
        state.routeHistory.pop();
      }
    },
    setShowRouteHistory: (state, action: PayloadAction<boolean>) => {
      state.showRouteHistory = action.payload;
    },
    removeRouteFromHistory: (state, action: PayloadAction<string>) => {
      state.routeHistory = state.routeHistory.filter(route => route.id !== action.payload);
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setShowAuth: (state, action: PayloadAction<boolean>) => {
      state.showAuth = action.payload;
    },
  },
});

export const { 
  addDestination, 
  removeDestination, 
  updateDestination, 
  setUserLocation, 
  setCurrentRoute, 
  setStickers,
  setLoading, 
  setError,
  setTheme,
  setSearchQuery,
  setShowSettings,
  setSelectedColor,
  setUserPreferences,
  addViewedAttraction,
  addSelectedAttraction,
  addCompletedTrip,
  addSearchHistory,
  setParsedInputData,
  setShowNaturalLanguageInput,
  setShowPreferenceSettings,
  setShowPersonalizedItinerary,
  addRouteToHistory,
  setShowRouteHistory,
  removeRouteFromHistory,
  setAuthenticated,
  setUser,
  setShowAuth,
} = routeSlice.actions;

export default routeSlice.reducer;