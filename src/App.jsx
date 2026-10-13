import SafetyHazardReport from "./SafetyHazardReport";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  calculateBalancedScore,
  calculateSafetyScore,
  getSafetyColor,
} from "./safetyEngine";

import "leaflet/dist/leaflet.css";

/* =========================================================
   POTHIK SETTINGS
========================================================= */

const MAP_CENTER = [23.8103, 90.4125];

const ROUTE_COLORS = [
  "#16a34a",
  "#f59e0b",
  "#7c3aed",
];

const EMERGENCY_ROUTE_COLOR = "#06b6d4";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const SEARCH_RADII = [
  10000,
  25000,
  50000,
];

const EMERGENCY_RADIUS = 50000;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* =========================================================
   BANGLA / ENGLISH
========================================================= */

const TEXT = {
  en: {
    home: "Home",
    about: "About",
    languageSwitch: "বাংলা",

    smartMobility: "SMART URBAN MOBILITY",
    heroTitle: "Safer Journeys for a Brighter Bangladesh",
    heroSubtitle:
      "Safety-aware route recommendations for safer urban mobility",

    from: "Start Location",
    destination: "Destination",
    startPlaceholder: "Enter starting location",
    destinationPlaceholder: "Enter destination",

    currentLocation: "Use My Current Location",
    currentLocationSelected: "Current location selected",

    findRoute: "Find Safe Route",
    calculating: "Calculating route...",
    searching: "Searching locations...",
    suggestions: "Location Suggestions",
    placeSource: "OpenStreetMap place data",

    enterStart: "Please enter a starting location.",
    enterDestination: "Please enter a destination.",
    locationNotFound:
      "Location not found. Try a more specific place name.",
    routeError:
      "Could not calculate the route. Check your internet and try again.",

    gpsUnsupported:
      "This browser does not support location access.",
    gpsDenied:
      "Location permission was denied. Allow location access in your browser settings.",
    gpsUnavailable:
      "Your device could not determine its current location.",
    gpsTimeout:
      "Getting your current location took too long. Please try again.",

    safetyMode: "Safety Mode",
    safetyModeSub: "Choose how safety should be prioritized.",
    generalSafety: "General Safety",
    womenSafety: "Women Safety",

    generalSafetyInfo:
      "Different safety indicators are considered in a balanced way.",

    womenSafetyInfo:
      "This prototype gives extra emphasis to lighting, crime history, public activity and emergency access.",

    travelTime: "Travel Time",
    travelTimeSub: "Choose the time for the prototype estimate.",
    day: "Day",
    night: "Night",

    weather: "Weather",
    clear: "Clear",
    rain: "Rain",
    heavyRain: "Heavy Rain",

    routeMap: "Route Map",
    routeMapSub: "Road routes provided by the routing service",
    routeAnalysis: "Route Analysis",
    emergencyRoute: "Emergency Route",

    routeOptions: "Route Options",
    availableRoutes: "Available Routes",
    route: "Route",
    routes: "routes",

    fastest: "Fastest",
    safest: "Safest",
    balanced: "Balanced",

    recommendation: "Pothik Recommendation:",
    balanceText:
      "offers the best balance between estimated travel time and the prototype safety score.",

    safetyAnalysis: "Safety Analysis",
    outOf100: "out of 100",
    saferChoice: "Safer choice (estimate)",
    moderateSafety: "Moderate estimate",
    lowerSafety: "Lower estimate",

    selectedRouteText:
      "is selected. This is a prototype score, not a verified live safety rating.",

    roadLighting: "Road Lighting",
    crimeHistory: "Crime History",
    emergencyAccess: "Emergency Access",
    roadCondition: "Road Condition",
    publicActivity: "Public Activity",
    timeRisk: "Time Risk",
    weatherRisk: "Weather Risk",

    emergencyServices: "Nearby Emergency Services",
    emergencyServicesSub:
      "Search for mapped hospitals, police stations or fire stations.",

    nearestHospital: "Nearest Hospital",
    nearestClinic: "Nearest Clinic / Health Centre",
    nearestPolice: "Nearest Police Station",
    nearestFire: "Nearest Fire Station",

    getRoute: "Find route to nearest service",
    searchingEmergency: "Searching mapped services...",
    routeToService: "Route to Emergency Service",

    noStartForEmergency:
      "Enter a starting location or use your current location first.",

    noServiceFound:
      "No matching service was found in the available map data. Try a nearby city or use the emergency hotline.",

    serviceRouteError:
      "Services were found, but a road route could not be calculated. Try another service or use the hotline.",

    emergencyHotlines: "Emergency Hotlines",
    nationalEmergency: "National Emergency",
    healthService: "Health Service",
    findNearestHospital: "Find Nearest Hospital",

    emergencyNavigation: "Emergency Navigation",
    active: "ACTIVE",

    emergencyRouteOnly:
      "Normal routes are hidden. Only the selected emergency-service route is displayed.",

    backNormal: "Back to Normal Routes",

    aboutLabel: "ABOUT POTHIK",
    aboutTitle: "What is Pothik?",

    aboutIntro:
      "Pothik is a safety-aware route recommendation system. It helps users compare road routes using estimated travel time and safety-related indicators.",

    howWorks: "How does Pothik work?",

    howWorksText:
      "Enter a starting place and destination, or use your current location. Pothik retrieves road routes and compares them using prototype indicators such as road lighting, crime history, emergency access, road condition, public activity, travel time and weather. The route distance and duration come from the routing service. Until verified safety datasets are integrated, the safety score remains an illustrative prototype estimate.",

    sdgTitle: "Pothik and the Sustainable Development Goals",

    sdg3Title: "Good Health and Well-being",
    sdg3Text:
      "Helps users find mapped hospitals and navigate to emergency services, supporting safer travel and access to assistance.",

    sdg5Title: "Gender Equality",
    sdg5Text:
      "Women Safety mode gives more weight to indicators such as lighting, public activity and emergency access. The score is an estimate and cannot guarantee safety.",

    sdg11Title: "Sustainable Cities and Communities",
    sdg11Text:
      "Promotes safer urban mobility by helping users compare routes rather than focusing only on the shortest route.",

    sdg16Title: "Peace, Justice and Strong Institutions",
    sdg16Text:
      "Helps users locate mapped police stations and other emergency services when they need them.",

    emergencySupport: "Emergency Support",
    emergencySupportText:
      "Registered users can save an emergency contact. SOS can show live browser location and open a phone or SMS app with a location link. The browser prototype does not silently send SMS messages or make calls.",

    prototypeNote:
      "Prototype notice: map coverage varies. Route geometry comes from a routing service, while safety factors are illustrative estimates rather than verified live crime or lighting data.",

    login: "Login",
    register: "Create Account",
    logout: "Log Out",

    welcome: "Welcome Back",
    loginSub: "Sign in to use Pothik.",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signIn: "Sign In",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    close: "Close",

    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    personalInfo: "Personal Information",
    emergencyContact: "Emergency Contact",
    relationship: "Relationship",
    emergencyPhone: "Emergency Contact Phone",

    emergency: "Emergency",
    sosActive: "Emergency SOS Active",
    liveLocation: "LIVE LOCATION",
    gettingLocation: "Getting your location...",
    callContact: "Call Contact",
    sendLocation: "Prepare Location SMS",
    openLocation: "Open on Map",
    stopSOS: "Stop SOS",

    latitude: "Latitude",
    longitude: "Longitude",
    accuracy: "Accuracy",
    updated: "Updated",

    accountNotFound: "No account was found.",
    incorrectPassword: "Incorrect password.",
    requiredFields: "Please fill in all required fields.",
    passwordMismatch: "Passwords do not match.",
    passwordShort: "Password must be at least 6 characters.",
    accountExists:
      "An account already exists with that email or phone.",
    loginError: "Could not sign in.",
    registerError: "Could not create the account.",
    sosLoginMessage:
      "Create an account and add an emergency contact first.",
    missingEmergencyContact:
      "Please add an emergency contact first.",
  },

  bn: {
    home: "হোম",
    about: "সম্পর্কে",
    languageSwitch: "English",

    smartMobility: "স্মার্ট নগর চলাচল",
    heroTitle: "আরও নিরাপদ যাত্রা, আরও সুন্দর বাংলাদেশ",
    heroSubtitle:
      "নিরাপত্তা বিবেচনা করে শহরে যাতায়াতের রুট পরামর্শ",

    from: "যাত্রা শুরুর স্থান",
    destination: "গন্তব্য",
    startPlaceholder: "যেখান থেকে যাবেন সেই স্থান লিখুন",
    destinationPlaceholder: "কোথায় যাবেন সেই স্থান লিখুন",

    currentLocation: "আমার বর্তমান অবস্থান ব্যবহার করুন",
    currentLocationSelected: "বর্তমান অবস্থান নির্বাচন করা হয়েছে",

    findRoute: "নিরাপদ রুট খুঁজুন",
    calculating: "রুট তৈরি হচ্ছে...",
    searching: "লোকেশন খোঁজা হচ্ছে...",
    suggestions: "মিলে যাওয়া স্থান",
    placeSource: "OpenStreetMap-এর স্থান-তথ্য",

    enterStart: "যাত্রা শুরুর স্থান লিখুন।",
    enterDestination: "গন্তব্য লিখুন।",
    locationNotFound:
      "এই স্থানটি পাওয়া যায়নি। আরও নির্দিষ্ট নাম দিয়ে চেষ্টা করুন।",
    routeError:
      "রুট তৈরি করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",

    gpsUnsupported:
      "আপনার ব্রাউজারে লোকেশন ব্যবহারের সুবিধা নেই।",
    gpsDenied:
      "লোকেশন ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজারের সেটিংস থেকে লোকেশন অনুমতি দিন।",
    gpsUnavailable:
      "আপনার ডিভাইসের বর্তমান অবস্থান পাওয়া যায়নি।",
    gpsTimeout:
      "বর্তমান অবস্থান পেতে বেশি সময় লাগছে। আবার চেষ্টা করুন।",

    safetyMode: "নিরাপত্তা মোড",
    safetyModeSub: "নিরাপত্তাকে কীভাবে গুরুত্ব দেওয়া হবে তা নির্বাচন করুন।",
    generalSafety: "সাধারণ নিরাপত্তা",
    womenSafety: "নারী নিরাপত্তা",

    generalSafetyInfo:
      "বিভিন্ন নিরাপত্তা সূচককে ভারসাম্য রেখে বিবেচনা করা হয়।",

    womenSafetyInfo:
      "এই প্রোটোটাইপে সড়কের আলো, অপরাধের ইতিহাস, মানুষের চলাচল ও জরুরি সেবায় পৌঁছানোর বিষয়কে বেশি গুরুত্ব দেওয়া হয়।",

    travelTime: "যাত্রার সময়",
    travelTimeSub: "প্রোটোটাইপের নিরাপত্তা হিসাবের সময় নির্বাচন করুন।",
    day: "দিন",
    night: "রাত",

    weather: "আবহাওয়া",
    clear: "পরিষ্কার",
    rain: "বৃষ্টি",
    heavyRain: "ভারী বৃষ্টি",

    routeMap: "রুটের মানচিত্র",
    routeMapSub: "রাউটিং সেবা থেকে পাওয়া সড়কের রুট",
    routeAnalysis: "রুট বিশ্লেষণ",
    emergencyRoute: "জরুরি রুট",

    routeOptions: "রুটের বিকল্প",
    availableRoutes: "পাওয়া রুট",
    route: "রুট",
    routes: "টি রুট",

    fastest: "দ্রুততম",
    safest: "নিরাপদতম",
    balanced: "ভারসাম্যপূর্ণ",

    recommendation: "পাথিকের পরামর্শ:",
    balanceText:
      "আনুমানিক সময় ও প্রোটোটাইপ নিরাপত্তা স্কোরের মধ্যে ভালো ভারসাম্য দেয়।",

    safetyAnalysis: "নিরাপত্তা বিশ্লেষণ",
    outOf100: "১০০-এর মধ্যে",
    saferChoice: "তুলনামূলক নিরাপদ (আনুমানিক)",
    moderateSafety: "মাঝারি অনুমান",
    lowerSafety: "কম অনুমান",

    selectedRouteText:
      "নির্বাচিত। এটি প্রোটোটাইপের স্কোর, যাচাইকৃত লাইভ নিরাপত্তা স্কোর নয়।",

    roadLighting: "সড়কের আলো",
    crimeHistory: "অপরাধের ইতিহাস",
    emergencyAccess: "জরুরি সেবায় পৌঁছানো",
    roadCondition: "রাস্তার অবস্থা",
    publicActivity: "মানুষের চলাচল",
    timeRisk: "সময়জনিত ঝুঁকি",
    weatherRisk: "আবহাওয়াজনিত ঝুঁকি",

    emergencyServices: "কাছাকাছি জরুরি সেবা",
    emergencyServicesSub:
      "মানচিত্রে থাকা হাসপাতাল, পুলিশ স্টেশন বা ফায়ার স্টেশন খুঁজুন।",

    nearestHospital: "নিকটস্থ হাসপাতাল",
    nearestClinic: "নিকটস্থ ক্লিনিক / স্বাস্থ্যকেন্দ্র",
    nearestPolice: "নিকটস্থ পুলিশ স্টেশন",
    nearestFire: "নিকটস্থ ফায়ার স্টেশন",

    getRoute: "নিকটস্থ সেবার রুট খুঁজুন",
    searchingEmergency: "জরুরি সেবা খোঁজা হচ্ছে...",
    routeToService: "জরুরি সেবার রুট",

    noStartForEmergency:
      "আগে যাত্রা শুরুর স্থান লিখুন অথবা বর্তমান অবস্থান ব্যবহার করুন।",

    noServiceFound:
      "উপলব্ধ মানচিত্রের তথ্যে কোনো সেবা পাওয়া যায়নি। কাছের শহরের স্থান দিয়ে চেষ্টা করুন অথবা জরুরি নম্বরে কল করুন।",

    serviceRouteError:
      "সেবা পাওয়া গেছে, কিন্তু সড়কের রুট তৈরি করা যায়নি। অন্য সেবা চেষ্টা করুন অথবা জরুরি নম্বরে কল করুন।",

    emergencyHotlines: "জরুরি যোগাযোগ নম্বর",
    nationalEmergency: "জাতীয় জরুরি সেবা",
    healthService: "স্বাস্থ্যসেবা",
    findNearestHospital: "নিকটস্থ হাসপাতাল খুঁজুন",

    emergencyNavigation: "জরুরি রুট নির্দেশনা",
    active: "চালু",

    emergencyRouteOnly:
      "সাধারণ রুট লুকানো আছে। শুধু নির্বাচিত জরুরি সেবার রুট দেখানো হচ্ছে।",

    backNormal: "সাধারণ রুটে ফিরে যান",

    aboutLabel: "পাথিক সম্পর্কে",
    aboutTitle: "পাথিক কী?",

    aboutIntro:
      "পাথিক একটি নিরাপত্তা-সচেতন রুট পরামর্শ ব্যবস্থা। এটি যাত্রার সময়ের পাশাপাশি নিরাপত্তা-সংক্রান্ত বিভিন্ন সূচকের ভিত্তিতে সড়কের রুট তুলনা করতে সাহায্য করে।",

    howWorks: "পাথিক কীভাবে কাজ করে?",

    howWorksText:
      "শুরুর স্থান ও গন্তব্য লিখুন অথবা বর্তমান অবস্থান ব্যবহার করুন। পাথিক সড়কের রুট সংগ্রহ করে এবং সড়কের আলো, অপরাধের ইতিহাস, জরুরি সেবা, রাস্তার অবস্থা, মানুষের চলাচল, সময় ও আবহাওয়ার মতো প্রোটোটাইপ সূচক দিয়ে রুটগুলো তুলনা করে। রুটের দূরত্ব ও সময় রাউটিং সেবা থেকে আসে। যাচাইকৃত নিরাপত্তা-তথ্য যুক্ত না হওয়া পর্যন্ত নিরাপত্তা স্কোরটি আনুমানিক।",

    sdgTitle: "টেকসই উন্নয়ন লক্ষ্যমাত্রায় পাথিকের অবদান",

    sdg3Title: "সুস্বাস্থ্য ও কল্যাণ",
    sdg3Text:
      "মানচিত্রে থাকা হাসপাতাল খুঁজে পেতে ও জরুরি সেবায় যাওয়ার পথ পেতে সাহায্য করে।",

    sdg5Title: "লিঙ্গ সমতা",
    sdg5Text:
      "নারী নিরাপত্তা মোডে সড়কের আলো, মানুষের চলাচল ও জরুরি সেবায় পৌঁছানোর বিষয়কে বেশি গুরুত্ব দেওয়া হয়। এই স্কোর নিরাপত্তার নিশ্চয়তা নয়।",

    sdg11Title: "টেকসই নগর ও জনপদ",
    sdg11Text:
      "শুধু সবচেয়ে ছোট পথ নয়, বিভিন্ন পথ তুলনা করে নিরাপদ নগর যাতায়াতকে সহায়তা করে।",

    sdg16Title: "শান্তি, ন্যায়বিচার ও শক্তিশালী প্রতিষ্ঠান",
    sdg16Text:
      "প্রয়োজনের সময় মানচিত্রে থাকা পুলিশ স্টেশন ও অন্যান্য জরুরি সেবা খুঁজে পেতে সাহায্য করে।",

    emergencySupport: "জরুরি সহায়তা",
    emergencySupportText:
      "নিবন্ধিত ব্যবহারকারী জরুরি যোগাযোগের তথ্য রাখতে পারেন। SOS চালু করলে ব্রাউজারে বর্তমান অবস্থান দেখা যায় এবং অবস্থানের লিংকসহ ফোন বা SMS অ্যাপ খোলা যায়। ব্যবহারকারীর নিশ্চিতকরণ ছাড়া এই প্রোটোটাইপ স্বয়ংক্রিয়ভাবে SMS পাঠায় না বা কল করে না।",

    prototypeNote:
      "প্রোটোটাইপ নোট: মানচিত্রের তথ্য সব জায়গায় সমান নয়। রুট রাউটিং সেবা থেকে আসে, তবে নিরাপত্তার সূচকগুলো যাচাইকৃত লাইভ অপরাধ বা সড়কের আলোর তথ্য নয়।",

    login: "লগইন",
    register: "অ্যাকাউন্ট তৈরি করুন",
    logout: "লগআউট",

    welcome: "আবার স্বাগতম",
    loginSub: "পাথিক ব্যবহার করতে লগইন করুন।",
    noAccount: "অ্যাকাউন্ট নেই?",
    hasAccount: "আগে থেকেই অ্যাকাউন্ট আছে?",
    signIn: "লগইন করুন",
    signingIn: "লগইন হচ্ছে...",
    creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    close: "বন্ধ করুন",

    fullName: "পূর্ণ নাম",
    email: "ইমেইল",
    phone: "ফোন",
    address: "ঠিকানা",
    password: "পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    personalInfo: "ব্যক্তিগত তথ্য",
    emergencyContact: "জরুরি যোগাযোগ",
    relationship: "সম্পর্ক",
    emergencyPhone: "জরুরি যোগাযোগের ফোন",

    emergency: "জরুরি সহায়তা",
    sosActive: "জরুরি SOS চালু",
    liveLocation: "লাইভ লোকেশন",
    gettingLocation: "আপনার অবস্থান নেওয়া হচ্ছে...",
    callContact: "যোগাযোগে কল করুন",
    sendLocation: "লোকেশনসহ SMS তৈরি করুন",
    openLocation: "মানচিত্রে খুলুন",
    stopSOS: "SOS বন্ধ করুন",

    latitude: "অক্ষাংশ",
    longitude: "দ্রাঘিমাংশ",
    accuracy: "নির্ভুলতা",
    updated: "আপডেট",

    accountNotFound: "এই ইমেইল বা ফোনের কোনো অ্যাকাউন্ট পাওয়া যায়নি।",
    incorrectPassword: "পাসওয়ার্ড সঠিক নয়।",
    requiredFields: "সব প্রয়োজনীয় তথ্য পূরণ করুন।",
    passwordMismatch: "দুটি পাসওয়ার্ড এক নয়।",
    passwordShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    accountExists: "এই ইমেইল বা ফোন দিয়ে অ্যাকাউন্ট আগে থেকেই আছে।",
    loginError: "লগইন করা যায়নি।",
    registerError: "অ্যাকাউন্ট তৈরি করা যায়নি।",
    sosLoginMessage: "আগে অ্যাকাউন্ট তৈরি করে জরুরি যোগাযোগের তথ্য যোগ করুন।",
    missingEmergencyContact: "আগে জরুরি যোগাযোগের তথ্য যোগ করুন।",
  },
};

/* =========================================================
   GENERAL HELPERS
========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePhone(value = "") {
  return value.replace(/[\s()-]/g, "");
}

function locationUrl(lat, lon) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

function formatDuration(minutes, language) {
  if (language === "en") {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins
      ? `${hours} hr ${mins} min`
      : `${hours} hr`;
  }

  if (minutes < 60) return `${minutes} মিনিট`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins
    ? `${hours} ঘণ্টা ${mins} মিনিট`
    : `${hours} ঘণ্টা`;
}

function distanceKm(a, b) {
  const R = 6371;

  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(
    Math.sqrt(x),
    Math.sqrt(1 - x)
  );
}

/* =========================================================
   SAFETY FACTORS
   These are demonstration estimates, not live data.
========================================================= */

function buildFactors(index, travelMode, weatherMode) {
  const base = [
    {
      lighting: 19,
      crime: 22,
      emergency: 14,
      road: 10,
      activity: 9,
      timeRisk: 9,
      weatherRisk: 5,
    },
    {
      lighting: 17,
      crime: 19,
      emergency: 12,
      road: 12,
      activity: 8,
      timeRisk: 8,
      weatherRisk: 4,
    },
    {
      lighting: 14,
      crime: 17,
      emergency: 10,
      road: 9,
      activity: 6,
      timeRisk: 7,
      weatherRisk: 3,
    },
  ][Math.min(index, 2)];

  const factors = { ...base };

  if (travelMode === "night") {
    factors.lighting -= 3;
    factors.activity -= 2;
    factors.timeRisk -= 2;
  }

  if (weatherMode === "rain") {
    factors.road -= 2;
    factors.weatherRisk -= 1;
  }

  if (weatherMode === "heavyRain") {
    factors.lighting -= 1;
    factors.road -= 4;
    factors.weatherRisk -= 3;
  }

  Object.keys(factors).forEach((key) => {
    factors[key] = Math.max(0, factors[key]);
  });

  return factors;
}

/* =========================================================
   LOCATION AUTOCOMPLETE AND GEOCODING
========================================================= */

async function searchPhoton(query, signal, limit = 6) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lat: String(MAP_CENTER[0]),
    lon: String(MAP_CENTER[1]),
    zoom: "10",
  });

  const response = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = await response.json();

  return (data.features || [])
    .map((feature, index) => {
      const coords = feature.geometry?.coordinates;

      if (!coords || coords.length < 2) {
        return null;
      }

      const p = feature.properties || {};

      const parts = [
        p.name,
        p.street,
        p.housenumber,
        p.district,
        p.city,
        p.state,
        p.country,
      ].filter(Boolean);

      const nameParts = parts.filter(
        (part, i) => parts.indexOf(part) === i
      );

      return {
        id: p.osm_id
          ? `${p.osm_type}-${p.osm_id}`
          : `${index}-${coords[0]}-${coords[1]}`,

        lat: Number(coords[1]),
        lon: Number(coords[0]),
        displayName: nameParts.join(", ") || query,
      };
    })
    .filter(Boolean);
}

async function geocodePlace(query) {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Location is empty");
  }

  const key =
    `pothik_geocode_${cleanQuery.toLowerCase()}`;

  try {
    const cached = localStorage.getItem(key);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore local cache errors.
  }

  const results = await searchPhoton(
    cleanQuery,
    undefined,
    1
  );

  if (!results.length) {
    throw new Error("Location not found");
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify(results[0])
    );
  } catch {
    // Ignore local cache errors.
  }

  return results[0];
}

/* =========================================================
   ACTUAL ROAD ROUTING
========================================================= */

async function fetchOSRMRoutes(start, end) {
  const coordinates =
    `${start[1]},${start[0]};${end[1]},${end[0]}`;

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
    "?overview=full&geometries=geojson&alternatives=3";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Routing service failed");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No road route found");
  }

  return data.routes.map((route, index) => ({
    id: index,

    coordinates: route.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    ),

    duration: Math.max(
      1,
      Math.round(route.duration / 60)
    ),

    distance: Number(
      (route.distance / 1000).toFixed(1)
    ),
  }));
}

/* =========================================================
   EMERGENCY SEARCH: OPENSTREETMAP OVERPASS
========================================================= */

/*
  Important improvements:
  1. Tries multiple Overpass servers.
  2. Expands the search radius if there are no results.
  3. Includes common alternative OSM tags.
  4. Sorts mapped facilities by straight-line distance.
  5. Returns several candidates so routing can try the next one.
*/

function emergencyTagSets(type) {
  if (type === "Hospital") {
    return [
      [
        "amenity",
        "hospital",
        "Hospital",
      ],
      [
        "healthcare",
        "hospital",
        "Hospital",
      ],
    ];
  }

  if (type === "Police") {
    return [
      [
        "amenity",
        "police",
        "Police",
      ],
      [
        "police",
        "station",
        "Police",
      ],
    ];
  }

  return [
    [
      "amenity",
      "fire_station",
      "Fire Station",
    ],
    [
      "building",
      "fire_station",
      "Fire Station",
    ],
  ];
}

function clinicTagSets() {
  return [
    [
      "amenity",
      "clinic",
      "Clinic",
    ],
    [
      "healthcare",
      "clinic",
      "Clinic",
    ],
    [
      "amenity",
      "doctors",
      "Clinic",
    ],
  ];
}

function makeOverpassQuery(
  lat,
  lon,
  radius,
  tagSets
) {
  const selectors = [];

  for (const [
    key,
    value,
  ] of tagSets) {
    const escapedKey = key.replace(/"/g, '\\"');
    const escapedValue = value.replace(/"/g, '\\"');

    selectors.push(
      `node["${escapedKey}"="${escapedValue}"](around:${radius},${lat},${lon});`
    );

    selectors.push(
      `way["${escapedKey}"="${escapedValue}"](around:${radius},${lat},${lon});`
    );

    selectors.push(
      `relation["${escapedKey}"="${escapedValue}"](around:${radius},${lat},${lon});`
    );
  }

  return (
    "[out:json][timeout:25];" +
    "(" +
    selectors.join("") +
    ");out center tags;"
  );
}

async function requestOverpass(
  endpoint,
  query
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    28000
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8",
      },

      body: new URLSearchParams({
        data: query,
      }),

      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Overpass returned HTTP ${response.status}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseEmergencyResults(
  data,
  start,
  requestedType
) {
  const seen = new Set();
  const results = [];

  for (const item of data.elements || []) {
    const tags = item.tags || {};

    const lat =
      item.lat ??
      item.center?.lat;

    const lon =
      item.lon ??
      item.center?.lon;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      continue;
    }

    const signature =
      `${Number(lat).toFixed(5)}-${Number(lon).toFixed(5)}`;

    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);

    const amenity =
      tags.amenity || "";

    const healthcare =
      tags.healthcare || "";

    const building =
      tags.building || "";

    let actualCategory = requestedType;

    if (requestedType === "Hospital") {
      if (
        amenity === "hospital" ||
        healthcare === "hospital"
      ) {
        actualCategory = "Hospital";
      } else if (
        amenity === "clinic" ||
        healthcare === "clinic" ||
        amenity === "doctors"
      ) {
        actualCategory = "Clinic";
      } else {
        continue;
      }
    }

    if (requestedType === "Police") {
      const isPolice =
        amenity === "police" ||
        tags.police === "station";

      if (!isPolice) {
        continue;
      }
    }

    if (requestedType === "Fire Station") {
      const isFire =
        amenity === "fire_station" ||
        building === "fire_station";

      if (!isFire) {
        continue;
      }
    }

    results.push({
      id: `${item.type}-${item.id}`,

      name:
        tags.name ||
        tags.operator ||
        (actualCategory === "Clinic"
          ? "Clinic / Health Centre"
          : requestedType),

      type: requestedType,

      category: actualCategory,

      position: [
        Number(lat),
        Number(lon),
      ],

      distance: distanceKm(
        start,
        [
          Number(lat),
          Number(lon),
        ]
      ),

      color:
        requestedType === "Hospital"
          ? "#dc2626"
          : requestedType === "Police"
          ? "#2563eb"
          : "#ea580c",
    });
  }

  results.sort((a, b) => {
    /*
      Hospital search only prioritizes clinics
      if no hospital candidate has been found.
      Here, hospital and clinic results are kept
      distinguishable so the caller can choose.
    */
    return a.distance - b.distance;
  });

  return results;
}

async function searchEmergencyAtRadius(
  start,
  type,
  radius,
  tagSets
) {
  const [lat, lon] = start;

  const query = makeOverpassQuery(
    lat,
    lon,
    radius,
    tagSets
  );

  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await requestOverpass(
        endpoint,
        query
      );

      const candidates =
        parseEmergencyResults(
          data,
          start,
          type
        );

      if (candidates.length) {
        return candidates;
      }
    } catch (error) {
      lastError = error;

      console.warn(
        "Emergency search endpoint failed:",
        endpoint,
        error?.message
      );
    }
  }

  if (lastError) {
    console.warn(
      "Emergency search had no successful endpoint at radius:",
      radius
    );
  }

  return [];
}

async function findNearbyEmergencyServices(
  start,
  type
) {
  /*
    Search actual hospitals, police stations or
    fire stations first. Radius expands only when
    the previous radius returned no matching data.
  */

  const tagSets =
    emergencyTagSets(type);

  for (const radius of SEARCH_RADII) {
    const candidates =
      await searchEmergencyAtRadius(
        start,
        type,
        radius,
        tagSets
      );

    if (candidates.length) {
      if (type === "Hospital") {
        const hospitals =
          candidates.filter(
            (service) =>
              service.category ===
              "Hospital"
          );

        if (hospitals.length) {
          return hospitals;
        }
      } else {
        return candidates;
      }
    }
  }

  /*
    Hospital fallback: if no hospital was found in
    any search radius, try mapped clinics/health centres.
    The UI will identify the result as a clinic.
  */

  if (type === "Hospital") {
    const clinics =
      await searchEmergencyAtRadius(
        start,
        type,
        EMERGENCY_RADIUS,
        clinicTagSets()
      );

    if (clinics.length) {
      return clinics.filter(
        (service) =>
          service.category ===
          "Clinic"
      );
    }
  }

  return [];
}

/* =========================================================
   AUTH STORAGE HELPERS
========================================================= */

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);

  const buffer = await crypto.subtle.digest(
    "SHA-256",
    bytes
  );

  return Array.from(
    new Uint8Array(buffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

function getUsers() {
  try {
    return JSON.parse(
      localStorage.getItem("pothik_users") || "[]"
    );
  } catch {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "pothik_current_user"
      ) || "null"
    );
  } catch {
    return null;
  }
}

/* =========================================================
   MAP HELPERS
========================================================= */

function RouteMapFitter({
  routes,
  emergencyRoute,
  center,
}) {
  const map = useMap();

  useEffect(() => {
    const routePoints =
      emergencyRoute?.coordinates?.length
        ? emergencyRoute.coordinates
        : routes.flatMap(
            (route) =>
              route.coordinates || []
          );

    if (routePoints.length) {
      map.fitBounds(
        L.latLngBounds(routePoints),
        {
          padding: [35, 35],
        }
      );
    } else {
      map.setView(center, 12);
    }
  }, [
    routes,
    emergencyRoute,
    map,
    center,
  ]);

  return null;
}

function RouteMap({
  center,
  start,
  destination,
  hasStart,
  hasDestination,
  startText,
  destinationText,
  routes,
  emergencyRoute,
  selectedEmergency,
  selectedRouteId,
  onRouteSelect,
  language,
}) {
  const t = TEXT[language];

  return (
    <div className="map-card">
      <div className="map-head">
        <div>
          <h2>{t.routeMap}</h2>
          <p>{t.routeMapSub}</p>
        </div>

        <span className="map-status">
          {emergencyRoute
            ? t.emergencyRoute
            : t.routeAnalysis}
        </span>
      </div>

      <div className="map-area">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RouteMapFitter
            routes={routes}
            emergencyRoute={emergencyRoute}
            center={center}
          />

          {hasStart && (
            <Marker position={start}>
              <Popup>
                <strong>{t.from}</strong>
                <br />
                {startText || t.currentLocation}
              </Popup>
            </Marker>
          )}

          {hasDestination &&
            !emergencyRoute && (
              <Marker position={destination}>
                <Popup>
                  <strong>{t.destination}</strong>
                  <br />
                  {destinationText}
                </Popup>
              </Marker>
            )}

          {emergencyRoute &&
            selectedEmergency && (
              <CircleMarker
                center={
                  selectedEmergency.position
                }
                radius={9}
                pathOptions={{
                  color:
                    selectedEmergency.color,

                  fillColor:
                    selectedEmergency.color,

                  fillOpacity: 0.9,

                  weight: 2,
                }}
              >
                <Popup>
                  <strong>
                    {selectedEmergency.name}
                  </strong>
                  <br />
                  {selectedEmergency.category}
                </Popup>
              </CircleMarker>
            )}

          {!emergencyRoute &&
            routes.map((route) => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                pathOptions={{
                  color:
                    route.id === selectedRouteId
                      ? "#0f8f4f"
                      : ROUTE_COLORS[
                          route.id %
                            ROUTE_COLORS.length
                        ],

                  weight:
                    route.id === selectedRouteId
                      ? 7
                      : 5,

                  opacity:
                    route.id === selectedRouteId
                      ? 0.95
                      : 0.58,

                  lineCap: "round",
                }}
                eventHandlers={{
                  click: () =>
                    onRouteSelect(route.id),
                }}
              />
            ))}

          {emergencyRoute && (
            <Polyline
              positions={
                emergencyRoute.coordinates
              }
              pathOptions={{
                color:
                  EMERGENCY_ROUTE_COLOR,

                weight: 8,
                opacity: 1,
                dashArray: "14 9",
                lineCap: "round",
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

/* =========================================================
   ABOUT AND SDG
========================================================= */

function AboutSection({ language }) {
  const t = TEXT[language];

  return (
    <section
      id="about"
      className="about-section"
    >
      <div className="about-header">
        <div className="about-label">
          {t.aboutLabel}
        </div>

        <h2>{t.aboutTitle}</h2>

        <p>{t.aboutIntro}</p>
      </div>

      <div className="about-info">
        <h3>{t.howWorks}</h3>
        <p>{t.howWorksText}</p>
      </div>

      <h3 className="sdg-title">
        {t.sdgTitle}
      </h3>

      <div className="sdg-grid">
        <div className="sdg-card sdg-3">
          <div className="sdg-number">
            SDG 3
          </div>
          <h4>{t.sdg3Title}</h4>
          <p>{t.sdg3Text}</p>
        </div>

        <div className="sdg-card sdg-5">
          <div className="sdg-number">
            SDG 5
          </div>
          <h4>{t.sdg5Title}</h4>
          <p>{t.sdg5Text}</p>
        </div>

        <div className="sdg-card sdg-11">
          <div className="sdg-number">
            SDG 11
          </div>
          <h4>{t.sdg11Title}</h4>
          <p>{t.sdg11Text}</p>
        </div>

        <div className="sdg-card sdg-16">
          <div className="sdg-number">
            SDG 16
          </div>
          <h4>{t.sdg16Title}</h4>
          <p>{t.sdg16Text}</p>
        </div>
      </div>

      <div className="about-emergency">
        <h3>{t.emergencySupport}</h3>
        <p>{t.emergencySupportText}</p>
      </div>

      <div className="about-note">
        {t.prototypeNote}
      </div>
    </section>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [language, setLanguage] =
    useState("bn");

  const t = TEXT[language];

  /* -------------------------------------------------------
     LOCATION INPUTS
  ------------------------------------------------------- */

  const [startText, setStartText] =
    useState("");

  const [destinationText, setDestinationText] =
    useState("");

  const [start, setStart] =
    useState(MAP_CENTER);

  const [destination, setDestination] =
    useState(MAP_CENTER);

  const [mapCenter, setMapCenter] =
    useState(MAP_CENTER);

  const [hasStart, setHasStart] =
    useState(false);

  const [hasDestination, setHasDestination] =
    useState(false);

  const [startSelectedPlace, setStartSelectedPlace] =
    useState(null);

  const [
    destinationSelectedPlace,
    setDestinationSelectedPlace,
  ] = useState(null);

  const [usingCurrentLocation, setUsingCurrentLocation] =
    useState(false);

  const visibleStartText =
    usingCurrentLocation
      ? t.currentLocationSelected
      : startText;

  /* -------------------------------------------------------
     AUTOCOMPLETE
  ------------------------------------------------------- */

  const [startSuggestions, setStartSuggestions] =
    useState([]);

  const [
    destinationSuggestions,
    setDestinationSuggestions,
  ] = useState([]);

  const [activeField, setActiveField] =
    useState(null);

  const [startSuggestLoading, setStartSuggestLoading] =
    useState(false);

  const [
    destinationSuggestLoading,
    setDestinationSuggestLoading,
  ] = useState(false);

  const startAbortRef = useRef(null);
  const destinationAbortRef = useRef(null);

  /* -------------------------------------------------------
     ROUTES
  ------------------------------------------------------- */

  const [routes, setRoutes] =
    useState([]);

  const [selectedRouteId, setSelectedRouteId] =
    useState(0);

  const [safetyMode, setSafetyMode] =
    useState("general");

  const [travelMode, setTravelMode] =
    useState("day");

  const [weatherMode, setWeatherMode] =
    useState("clear");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------
     EMERGENCY ROUTES
  ------------------------------------------------------- */

  const [emergencyRoute, setEmergencyRoute] =
    useState(null);

  const [selectedEmergency, setSelectedEmergency] =
    useState(null);

  const [emergencyLoading, setEmergencyLoading] =
    useState(false);

  const [emergencyError, setEmergencyError] =
    useState("");

  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  const [currentUser, setCurrentUser] =
    useState(getCurrentUser());

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [authView, setAuthView] =
    useState(null);

  const [authError, setAuthError] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  const [loginForm, setLoginForm] =
    useState({
      identifier: "",
      password: "",
    });

  const [registerForm, setRegisterForm] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
    });

  /* -------------------------------------------------------
     SOS
  ------------------------------------------------------- */

  const [sosActive, setSosActive] =
    useState(false);

  const [sosLocation, setSosLocation] =
    useState(null);

  const [sosError, setSosError] =
    useState("");

  const sosWatchRef = useRef(null);

  /* =======================================================
     AUTOCOMPLETE EFFECTS
  ======================================================= */

  useEffect(() => {
    if (
      usingCurrentLocation ||
      startSelectedPlace
    ) {
      setStartSuggestions([]);
      setStartSuggestLoading(false);
      return undefined;
    }

    const query = startText.trim();

    if (query.length < 2) {
      setStartSuggestions([]);
      setStartSuggestLoading(false);
      return undefined;
    }

    const controller =
      new AbortController();

    startAbortRef.current?.abort();
    startAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setStartSuggestLoading(true);

      try {
        const results = await searchPhoton(
          query,
          controller.signal,
          6
        );

        if (!controller.signal.aborted) {
          setStartSuggestions(results);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error(err);
          setStartSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setStartSuggestLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    startText,
    startSelectedPlace,
    usingCurrentLocation,
  ]);

  useEffect(() => {
    if (destinationSelectedPlace) {
      setDestinationSuggestions([]);
      setDestinationSuggestLoading(false);
      return undefined;
    }

    const query = destinationText.trim();

    if (query.length < 2) {
      setDestinationSuggestions([]);
      setDestinationSuggestLoading(false);
      return undefined;
    }

    const controller =
      new AbortController();

    destinationAbortRef.current?.abort();
    destinationAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setDestinationSuggestLoading(true);

      try {
        const results = await searchPhoton(
          query,
          controller.signal,
          6
        );

        if (!controller.signal.aborted) {
          setDestinationSuggestions(results);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error(err);
          setDestinationSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDestinationSuggestLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    destinationText,
    destinationSelectedPlace,
  ]);

  /* =======================================================
     LOCATION INPUT HANDLERS
  ======================================================= */

  const handleStartInput = (value) => {
    setStartText(value);

    setStartSelectedPlace(null);
    setUsingCurrentLocation(false);
    setHasStart(false);

    setError("");
    setActiveField("start");
  };

  const handleDestinationInput = (value) => {
    setDestinationText(value);

    setDestinationSelectedPlace(null);
    setHasDestination(false);

    setError("");
    setActiveField("destination");
  };

  const choosePlace = (place, field) => {
    const coords = [
      place.lat,
      place.lon,
    ];

    if (field === "start") {
      setStart(coords);
      setStartText(place.displayName);
      setStartSelectedPlace(place);
      setUsingCurrentLocation(false);
      setHasStart(true);
      setStartSuggestions([]);
    } else {
      setDestination(coords);
      setDestinationText(place.displayName);
      setDestinationSelectedPlace(place);
      setHasDestination(true);
      setDestinationSuggestions([]);
    }

    setMapCenter(coords);
    setActiveField(null);
    setError("");
  };

  /* =======================================================
     CURRENT LOCATION
  ======================================================= */

  const getCurrentLocation = () => {
    setError("");
    setActiveField(null);
    setStartSuggestions([]);

    if (!navigator.geolocation) {
      setError(t.gpsUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setStart(coords);
        setMapCenter(coords);
        setHasStart(true);

        setStartSelectedPlace(null);
        setUsingCurrentLocation(true);
        setStartText("");
        setError("");
      },

      (geoError) => {
        if (geoError.code === 1) {
          setError(t.gpsDenied);
        } else if (geoError.code === 3) {
          setError(t.gpsTimeout);
        } else {
          setError(t.gpsUnavailable);
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );
  };

  /* =======================================================
     RESOLVE INPUTS TO COORDINATES
  ======================================================= */

  const resolveStart = async () => {
    if (
      usingCurrentLocation &&
      hasStart
    ) {
      return [...start];
    }

    if (startSelectedPlace) {
      return [
        startSelectedPlace.lat,
        startSelectedPlace.lon,
      ];
    }

    if (!startText.trim()) {
      throw new Error("START_REQUIRED");
    }

    const place = await geocodePlace(startText);

    const coords = [
      place.lat,
      place.lon,
    ];

    setStart(coords);
    setMapCenter(coords);
    setHasStart(true);
    setStartSelectedPlace(place);
    setStartText(place.displayName);
    setUsingCurrentLocation(false);

    return coords;
  };

  const resolveDestination = async () => {
    if (destinationSelectedPlace) {
      return [
        destinationSelectedPlace.lat,
        destinationSelectedPlace.lon,
      ];
    }

    if (!destinationText.trim()) {
      throw new Error("DESTINATION_REQUIRED");
    }

    const place = await geocodePlace(
      destinationText
    );

    const coords = [
      place.lat,
      place.lon,
    ];

    setDestination(coords);
    setMapCenter(coords);
    setHasDestination(true);
    setDestinationSelectedPlace(place);
    setDestinationText(place.displayName);

    return coords;
  };

  /* =======================================================
     FIND ROUTES BETWEEN ANY TWO LOCATIONS
  ======================================================= */

  const handleFindRoute = async () => {
    setError("");
    setEmergencyError("");

    setEmergencyRoute(null);
    setSelectedEmergency(null);

    setLoading(true);

    try {
      const routeStart =
        await resolveStart();

      const routeEnd =
        await resolveDestination();

      const realRoutes =
        await fetchOSRMRoutes(
          routeStart,
          routeEnd
        );

      const preparedRoutes =
        realRoutes.slice(0, 3).map(
          (route, index) => {
            const factors = buildFactors(
              index,
              travelMode,
              weatherMode
            );

            return {
              ...route,
              factors,

              safetyScore:
                calculateSafetyScore(
                  factors,
                  safetyMode
                ),
            };
          }
        );

      setStart(routeStart);
      setDestination(routeEnd);

      setHasStart(true);
      setHasDestination(true);

      setMapCenter(routeStart);

      setRoutes(preparedRoutes);

      setSelectedRouteId(
        preparedRoutes[0]?.id ?? 0
      );

      setActiveField(null);
      setStartSuggestions([]);
      setDestinationSuggestions([]);
    } catch (err) {
      console.error(err);

      if (err?.message === "START_REQUIRED") {
        setError(t.enterStart);
      } else if (
        err?.message === "DESTINATION_REQUIRED"
      ) {
        setError(t.enterDestination);
      } else if (
        String(err?.message || "").includes(
          "Location not found"
        )
      ) {
        setError(t.locationNotFound);
      } else {
        setError(t.routeError);
      }

      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     UPDATE SAFETY SCORES WHEN MODE CHANGES
  ======================================================= */

  useEffect(() => {
    setRoutes((previous) =>
      previous.map((route, index) => {
        const factors = buildFactors(
          index,
          travelMode,
          weatherMode
        );

        return {
          ...route,
          factors,

          safetyScore:
            calculateSafetyScore(
              factors,
              safetyMode
            ),
        };
      })
    );
  }, [
    safetyMode,
    travelMode,
    weatherMode,
  ]);

  /* =======================================================
     ROUTE ANALYSIS
  ======================================================= */

  const minDuration = routes.length
    ? Math.min(
        ...routes.map(
          (route) => route.duration
        )
      )
    : 0;

  const maxDuration = routes.length
    ? Math.max(
        ...routes.map(
          (route) => route.duration
        )
      )
    : 0;

  const analyzedRoutes = useMemo(
    () =>
      routes.map((route) => ({
        ...route,

        balancedScore:
          Math.round(
            calculateBalancedScore(
              route.safetyScore,
              route.duration,
              minDuration,
              maxDuration
            )
          ),
      })),

    [
      routes,
      minDuration,
      maxDuration,
    ]
  );

  const fastestRoute =
    analyzedRoutes.length
      ? analyzedRoutes.reduce(
          (best, route) =>
            route.duration < best.duration
              ? route
              : best,

          analyzedRoutes[0]
        )
      : null;

  const safestRoute =
    analyzedRoutes.length
      ? analyzedRoutes.reduce(
          (best, route) =>
            route.safetyScore > best.safetyScore
              ? route
              : best,

          analyzedRoutes[0]
        )
      : null;

  const balancedRoute =
    analyzedRoutes.length
      ? analyzedRoutes.reduce(
          (best, route) =>
            route.balancedScore > best.balancedScore
              ? route
              : best,

          analyzedRoutes[0]
        )
      : null;

  const activeRoute =
    analyzedRoutes.find(
      (route) =>
        route.id === selectedRouteId
    ) || analyzedRoutes[0];

  const routeLabel = (id) =>
    language === "bn"
      ? `রুট ${id + 1}`
      : `Route ${id + 1}`;

  const safetyStatus = (score) => {
    if (score >= 80) {
      return t.saferChoice;
    }

    if (score >= 60) {
      return t.moderateSafety;
    }

    return t.lowerSafety;
  };

  const routeReasons = useMemo(() => {
    if (!activeRoute) {
      return [];
    }

    const f = activeRoute.factors;

    const reasons = [];

    if (f.lighting >= 18) {
      reasons.push(
        language === "bn"
          ? "আলোর সূচকে তুলনামূলক বেশি স্কোর"
          : "Higher lighting factor"
      );
    }

    if (f.crime >= 20) {
      reasons.push(
        language === "bn"
          ? "অপরাধ-ইতিহাসের সূচকে তুলনামূলক বেশি স্কোর"
          : "Higher crime-history factor"
      );
    }

    if (f.emergency >= 12) {
      reasons.push(
        language === "bn"
          ? "জরুরি সেবার সূচকে তুলনামূলক বেশি স্কোর"
          : "Higher emergency-access factor"
      );
    }

    if (f.activity >= 8) {
      reasons.push(
        language === "bn"
          ? "মানুষের চলাচলের সূচকে তুলনামূলক বেশি স্কোর"
          : "Higher public-activity factor"
      );
    }

    if (f.road >= 10) {
      reasons.push(
        language === "bn"
          ? "রাস্তার অবস্থার সূচকে তুলনামূলক বেশি স্কোর"
          : "Higher road-condition factor"
      );
    }

    return reasons.slice(0, 4);
  }, [
    activeRoute,
    language,
  ]);

  /*
    Only one factorItems declaration exists here.
  */

  const factorItems = activeRoute
    ? [
        {
          label: t.roadLighting,
          value: activeRoute.factors.lighting,
          max: 20,
        },
        {
          label: t.crimeHistory,
          value: activeRoute.factors.crime,
          max: 25,
        },
        {
          label: t.emergencyAccess,
          value: activeRoute.factors.emergency,
          max: 15,
        },
        {
          label: t.roadCondition,
          value: activeRoute.factors.road,
          max: 15,
        },
        {
          label: t.publicActivity,
          value: activeRoute.factors.activity,
          max: 10,
        },
        {
          label: t.timeRisk,
          value: activeRoute.factors.timeRisk,
          max: 10,
        },
        {
          label: t.weatherRisk,
          value: activeRoute.factors.weatherRisk,
          max: 5,
        },
      ]
    : [];

  /* =======================================================
     EMERGENCY ROUTE
  ======================================================= */

  const getEmergencyTitle = (type) => {
    if (type === "Hospital") {
      return t.nearestHospital;
    }

    if (type === "Police") {
      return t.nearestPolice;
    }

    return t.nearestFire;
  };

  const serviceCategoryLabel = (service) => {
    if (
      service?.type === "Hospital" &&
      service?.category === "Clinic"
    ) {
      return t.nearestClinic;
    }

    return getEmergencyTitle(
      service?.type
    );
  };

  const handleEmergencyRoute = async (type) => {
    setEmergencyError("");
    setError("");

    setEmergencyLoading(true);

    setEmergencyRoute(null);
    setSelectedEmergency(null);

    let origin;

    try {
      /*
        Resolve the start from the selected place,
        current GPS, or typed location.
        No destination is required for emergency search.
      */

      origin = await resolveStart();

      setStart(origin);
      setHasStart(true);
      setMapCenter(origin);
    } catch (err) {
      console.error(err);

      setEmergencyError(
        err?.message === "START_REQUIRED"
          ? t.noStartForEmergency
          : t.locationNotFound
      );

      setEmergencyLoading(false);

      return;
    }

    try {
      const services =
        await findNearbyEmergencyServices(
          origin,
          type
        );

      if (!services.length) {
        throw new Error("NO_SERVICE_FOUND");
      }

      /*
        Some mapped facilities may not connect to
        the routable road network. Try the closest
        candidates one by one until a road route works.
      */

      let successfulRoute = null;
      let successfulService = null;

      for (
        const service of services.slice(0, 8)
      ) {
        try {
          const routesToService =
            await fetchOSRMRoutes(
              origin,
              service.position
            );

          if (routesToService.length) {
            successfulRoute =
              routesToService[0];

            successfulService =
              service;

            break;
          }
        } catch (routeError) {
          console.warn(
            "Could not route to this service; trying the next candidate.",
            service.name,
            routeError?.message
          );
        }
      }

      if (
        !successfulRoute ||
        !successfulService
      ) {
        throw new Error("NO_SERVICE_ROUTE");
      }

      setSelectedEmergency(
        successfulService
      );

      setEmergencyRoute({
        ...successfulRoute,
        service: successfulService,
      });

      /*
        Keep normal routes in state.
        They are hidden while emergencyRoute is active,
        and reappear when the user exits emergency mode.
      */
    } catch (err) {
      console.error(err);

      if (
        err?.message === "NO_SERVICE_FOUND"
      ) {
        setEmergencyError(
          t.noServiceFound
        );
      } else if (
        err?.message === "NO_SERVICE_ROUTE"
      ) {
        setEmergencyError(
          t.serviceRouteError
        );
      } else {
        setEmergencyError(
          t.noServiceFound
        );
      }
    } finally {
      setEmergencyLoading(false);
    }
  };

  const exitEmergencyMode = () => {
    setEmergencyRoute(null);
    setSelectedEmergency(null);
    setEmergencyError("");
  };

  /* =======================================================
     AUTH
  ======================================================= */

  const openAuth = (view) => {
    setAuthView(view);
    setAuthError("");
    setProfileOpen(false);
  };

  const closeAuth = () => {
    setAuthView(null);
    setAuthError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      const identifier =
        loginForm.identifier.trim().toLowerCase();

      const phone =
        normalizePhone(
          loginForm.identifier
        );

      const user = getUsers().find(
        (item) =>
          item.email === identifier ||
          item.phone === phone
      );

      if (!user) {
        setAuthError(t.accountNotFound);
        return;
      }

      const passwordHash =
        await hashPassword(
          loginForm.password
        );

      if (
        passwordHash !== user.passwordHash
      ) {
        setAuthError(t.incorrectPassword);
        return;
      }

      const session = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        emergencyContact: user.emergencyContact,
      };

      localStorage.setItem(
        "pothik_current_user",
        JSON.stringify(session)
      );

      setCurrentUser(session);
      closeAuth();
    } catch (err) {
      console.error(err);
      setAuthError(t.loginError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setAuthError("");

    const form = registerForm;

    const requiredValues = [
      form.fullName,
      form.email,
      form.phone,
      form.address,
      form.password,
      form.confirmPassword,
      form.emergencyName,
      form.emergencyRelationship,
      form.emergencyPhone,
    ];

    if (
      !requiredValues.every(
        (value) => value.trim()
      )
    ) {
      setAuthError(t.requiredFields);
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setAuthError(t.passwordMismatch);
      return;
    }

    if (form.password.length < 6) {
      setAuthError(t.passwordShort);
      return;
    }

    const email =
      form.email.trim().toLowerCase();

    const phone =
      normalizePhone(form.phone);

    const users = getUsers();

    if (
      users.some(
        (user) =>
          user.email === email ||
          user.phone === phone
      )
    ) {
      setAuthError(t.accountExists);
      return;
    }

    setAuthLoading(true);

    try {
      const passwordHash =
        await hashPassword(
          form.password
        );

      const user = {
        id:
          crypto.randomUUID?.() ||
          `user-${Date.now()}`,

        fullName:
          form.fullName.trim(),

        email,
        phone,

        address:
          form.address.trim(),

        passwordHash,

        emergencyContact: {
          name:
            form.emergencyName.trim(),

          relationship:
            form.emergencyRelationship.trim(),

          phone:
            normalizePhone(
              form.emergencyPhone
            ),
        },
      };

      localStorage.setItem(
        "pothik_users",
        JSON.stringify([
          ...users,
          user,
        ])
      );

      const session = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        emergencyContact: user.emergencyContact,
      };

      localStorage.setItem(
        "pothik_current_user",
        JSON.stringify(session)
      );

      setCurrentUser(session);
      closeAuth();
    } catch (err) {
      console.error(err);
      setAuthError(t.registerError);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    stopSOS();

    localStorage.removeItem(
      "pothik_current_user"
    );

    setCurrentUser(null);
    setProfileOpen(false);
  };

  /* =======================================================
     LIVE SOS
  ======================================================= */

  const updateSOSLocation = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    setSosLocation({
      latitude: lat,
      longitude: lon,

      accuracy: Math.round(
        position.coords.accuracy
      ),

      timestamp:
        new Date().toISOString(),
    });

    setStart([lat, lon]);
    setHasStart(true);
    setUsingCurrentLocation(true);
    setStartText("");
    setStartSelectedPlace(null);
    setMapCenter([lat, lon]);
  };

  const startSOS = () => {
    if (!currentUser) {
      openAuth("register");
      setAuthError(t.sosLoginMessage);
      return;
    }

    if (
      !currentUser.emergencyContact?.phone
    ) {
      openAuth("register");
      setAuthError(
        t.missingEmergencyContact
      );

      return;
    }

    if (!navigator.geolocation) {
      setSosError(t.gpsUnsupported);
      return;
    }

    setSosActive(true);
    setSosLocation(null);
    setSosError("");

    navigator.geolocation.getCurrentPosition(
      updateSOSLocation,

      (geoError) => {
        setSosError(
          geoError.code === 1
            ? t.gpsDenied
            : geoError.code === 3
            ? t.gpsTimeout
            : t.gpsUnavailable
        );
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );

    sosWatchRef.current =
      navigator.geolocation.watchPosition(
        updateSOSLocation,

        (geoError) => {
          setSosError(
            geoError.code === 1
              ? t.gpsDenied
              : geoError.code === 3
              ? t.gpsTimeout
              : t.gpsUnavailable
          );
        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 20000,
        }
      );
  };

  function stopSOS() {
    if (
      sosWatchRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        sosWatchRef.current
      );
    }

    sosWatchRef.current = null;

    setSosActive(false);
    setSosLocation(null);
    setSosError("");
  }

  const callEmergencyContact = () => {
    const phone =
      currentUser?.emergencyContact?.phone;

    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const sendLocationSMS = () => {
    const phone =
      currentUser?.emergencyContact?.phone;

    if (!phone || !sosLocation) {
      return;
    }

    const message =
      language === "bn"
        ? `পাথিক জরুরি বার্তা। আমার বর্তমান অবস্থান: ${locationUrl(
            sosLocation.latitude,
            sosLocation.longitude
          )}`
        : `Pothik SOS. My current location: ${locationUrl(
            sosLocation.latitude,
            sosLocation.longitude
          )}`;

    window.location.href =
      `sms:${phone}?body=${encodeURIComponent(
        message
      )}`;
  };

  useEffect(() => {
    return () => {
      startAbortRef.current?.abort();
      destinationAbortRef.current?.abort();

      if (
        sosWatchRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          sosWatchRef.current
        );
      }
    };
  }, []);

  /* =======================================================
     STYLES
  ======================================================= */

  const styles = `
    *{box-sizing:border-box}
    html,body,#root{margin:0;width:100%;min-height:100%}
    body{font-family:Inter,"Noto Sans Bengali","Nirmala UI",system-ui,sans-serif;color:#173b60;background:#e4f1f7}
    button,input,textarea{font:inherit}
    button{cursor:pointer}

    .pothik-app{min-height:100vh;width:100%;overflow-x:hidden;background:linear-gradient(rgba(238,248,255,.62),rgba(239,249,243,.68)),url('/dhaka-bg.png') center/cover fixed no-repeat;background-color:#dceef7}

    .topbar{position:sticky;top:0;z-index:2000;width:100%;height:88px;background:rgba(255,255,255,.93);border-bottom:1px solid #dce8ef;backdrop-filter:blur(16px);box-shadow:0 8px 25px rgba(30,70,100,.08)}
    .topbar-inner{width:100%;height:100%;padding:0 30px;display:flex;align-items:center;gap:14px}
    .brand img{width:235px;height:82px;object-fit:contain;display:block}
    .main-nav{margin-left:auto;display:flex;align-items:center;gap:6px}
    .main-nav a,.language-btn{height:40px;padding:0 15px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid transparent;background:transparent;color:#244b69;font-size:12px;font-weight:850;text-decoration:none}
    .main-nav a.active{color:white;background:linear-gradient(135deg,#0a619d,#1978b7);box-shadow:0 8px 18px rgba(10,97,157,.2)}
    .language-btn{background:white;border-color:#cfe0ea;color:#155c8d}
    .header-actions{display:flex;align-items:center;gap:7px}
    .account-btn{min-height:40px;padding:0 14px;border:1px solid #d9e6ef;border-radius:999px;background:white;color:#254a67;font-weight:850}
    .emergency-header{min-height:40px;padding:0 17px;border:0;border-radius:999px;color:white;background:linear-gradient(135deg,#ef233c,#ff416c);font-weight:900;box-shadow:0 9px 20px rgba(239,35,60,.19)}
    .status-pill{min-height:38px;padding:0 13px;display:flex;align-items:center;gap:7px;border:1px solid #bfe9cf;border-radius:999px;color:#167142;background:#effaf4;font-size:10px;font-weight:850}
    .status-dot{width:7px;height:7px;border-radius:50%;background:#16a34a}

    .page{max-width:1380px;margin:auto;padding:24px 24px 45px;position:relative;z-index:2}
    .hero{text-align:center;padding:18px 10px 23px}
    .hero-tag{display:inline-block;padding:8px 13px;border-radius:999px;background:rgba(255,255,255,.78);color:#29668f;font-size:9px;font-weight:900}
    .hero h1{max-width:900px;margin:10px auto 8px;color:#143d65;font-size:clamp(34px,4vw,54px);line-height:1.06;font-weight:950}
    .hero p{max-width:720px;margin:auto;color:#3d617d;font-size:15px;line-height:1.6;font-weight:650}

    .glass,.map-card,.route-options,.side-card,.about-section{background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.96);box-shadow:0 18px 42px rgba(20,68,102,.12);backdrop-filter:blur(14px)}
    .search-panel{padding:20px;border-radius:26px;margin-bottom:16px}
    .search-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:12px;align-items:end}
    .field{position:relative;min-width:0}
    .field label{display:block;margin-bottom:7px;color:#59738b;font-size:10px;font-weight:900}
    .input-wrap{position:relative}
    .location-input{width:100%;height:55px;padding:0 50px 0 15px;border:1px solid #d4e3ec;border-radius:15px;background:rgba(255,255,255,.96);color:#183d60;outline:none;font-size:13px;font-weight:750}
    .location-input:focus{border-color:#1975b2;box-shadow:0 0 0 4px rgba(25,117,178,.08)}
    .current-location-btn{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:33px;height:33px;border:1px solid #d5e6ef;border-radius:10px;background:#f0f8fc;color:#17679a;font-size:16px;font-weight:900}
    .current-location-btn:hover{background:#e2f2fa}

    .suggestions-box{position:absolute;top:calc(100% + 7px);left:0;right:0;z-index:3000;overflow:hidden;border:1px solid #d6e5ee;border-radius:15px;background:rgba(255,255,255,.99);box-shadow:0 18px 40px rgba(20,68,102,.16)}
    .suggestions-title{padding:8px 12px;color:#6d8498;font-size:8px;font-weight:900;border-bottom:1px solid #edf3f7}
    .suggestion-item{width:100%;padding:10px 12px;border:0;border-bottom:1px solid #eef3f7;background:white;text-align:left;color:#1e4665}
    .suggestion-item:hover{background:#f0f8fc}
    .suggestion-item:last-child{border-bottom:0}
    .suggestion-name{font-size:10px;font-weight:900;line-height:1.5}
    .suggestion-source{margin-top:2px;color:#7b90a1;font-size:8px}
    .suggestion-loading{padding:12px;color:#56738c;font-size:9px;font-weight:800}
    .current-location-info{margin-top:5px;color:#1d8554;font-size:8px;font-weight:850}

    .primary-btn{min-width:185px;height:55px;border:0;border-radius:15px;color:white;background:linear-gradient(135deg,#0b619d,#1977b4);font-weight:900;box-shadow:0 10px 22px rgba(11,97,157,.2)}
    .primary-btn:disabled{opacity:.6;cursor:wait}
    .error-box{margin-top:10px;padding:11px 13px;border-radius:12px;background:#fff1f2;color:#be123c;font-size:10px;font-weight:800;line-height:1.6}

    .controls-row{margin-top:15px;padding-top:15px;border-top:1px solid #dae7ee;display:grid;grid-template-columns:1fr 1fr;gap:13px}
    .control-block{padding:15px;border-radius:17px;background:rgba(248,252,255,.74);border:1px solid #dceaf1}
    .control-title{color:#1b4264;font-size:12px;font-weight:900}
    .control-sub{margin-top:4px;color:#6b8398;font-size:10px;line-height:1.6}
    .segmented{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
    .control-btn{min-height:37px;padding:0 12px;border:1px solid #d4e2ec;border-radius:10px;background:white;color:#3a5b75;font-size:10px;font-weight:850}
    .control-btn.active{color:white;border-color:#176fae;background:linear-gradient(135deg,#0c639f,#1978b6)}
    .mode-highlight{margin-top:9px;padding:10px 11px;border-radius:11px;background:rgba(255,255,255,.74);color:#617a90;font-size:9px;line-height:1.6}

    .workspace{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(340px,.88fr);gap:16px;align-items:start}
    .map-card{overflow:hidden;border-radius:26px}
    .map-head{min-height:78px;padding:15px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #dae7ee;gap:10px}
    .map-head h2{margin:0;color:#173d60;font-size:18px;font-weight:900}
    .map-head p{margin:4px 0 0;color:#6a8197;font-size:10px;line-height:1.5}
    .map-status{padding:8px 11px;border-radius:999px;background:#ebf6fb;color:#2d658f;font-size:9px;font-weight:900}
    .map-area{height:610px}

    .right-column{display:flex;flex-direction:column;gap:13px}
    .route-options,.side-card{padding:17px;border-radius:23px}
    .card-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .card-title{color:#173d60;font-size:16px;font-weight:900}
    .card-tag{padding:6px 9px;border-radius:999px;background:#eaf6fb;color:#28628b;font-size:8px;font-weight:900}
    .section-small{margin-top:9px;color:#71869a;font-size:9px;font-weight:900}
    .route-card{width:100%;margin-top:8px;padding:12px;border:1px solid #dbe7ef;border-radius:15px;background:rgba(255,255,255,.9);text-align:left}
    .route-card.selected{border-color:#55c994;background:linear-gradient(135deg,#eefcf5,#fff)}
    .route-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .route-label{color:#74889a;font-size:8px;font-weight:850}
    .route-name{margin-top:3px;color:#183d60;font-size:13px;font-weight:900}
    .route-score{width:48px;height:48px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;background:#0d7048;color:white;border:3px solid #d8f2e4;font-size:13px;font-weight:950}
    .route-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}
    .route-badge{padding:4px 6px;border-radius:999px;background:#edf6fb;color:#5a758d;font-size:8px;font-weight:850}
    .route-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;color:#607990;font-size:9px;font-weight:750}
    .recommendation{margin-top:10px;padding:10px;border-radius:12px;background:#edf7fc;color:#3a617d;font-size:9px;line-height:1.6}
    .score{font-size:26px;font-weight:950}
    .score-sub{color:#71869a;font-size:9px;text-align:right}
    .status{margin:11px auto 13px;width:max-content;max-width:100%;padding:7px 10px;border-radius:999px;font-size:9px;font-weight:900;text-align:center}
    .reason-box{padding:11px;border-radius:12px;background:#eefaf4;color:#55715f;font-size:10px;line-height:1.6}
    .reason-list{margin:12px 0 15px;display:grid;gap:7px}
    .reason{display:flex;gap:7px;color:#587187;font-size:9px;line-height:1.5}
    .check{color:#16a34a;font-weight:950}
    .factor{margin-top:11px}
    .factor-top{display:flex;justify-content:space-between;gap:10px;color:#3f5c74;font-size:9px;font-weight:850}
    .factor-value{color:#16804e;font-weight:900}
    .bar{height:6px;margin-top:5px;border-radius:999px;overflow:hidden;background:#e4edf3}
    .bar-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#12a45f,#35c978)}

    .emergency-list{margin-top:10px;display:grid;gap:8px}
    .service-btn{width:100%;min-height:53px;padding:9px 11px;display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #dbe7ef;border-radius:13px;background:rgba(249,252,254,.9);color:#294b65}
    .service-btn:disabled{opacity:.6;cursor:wait}
    .service-left{text-align:left;min-width:0}
    .service-name{font-size:11px;font-weight:900}
    .service-sub{margin-top:3px;color:#71879a;font-size:8px;line-height:1.5}
    .service-arrow{font-size:18px;font-weight:700}
    .emergency-route-box{margin-top:10px;padding:12px;border:1px solid #a5f3fc;border-radius:13px;background:#ecfeff;color:#0e7490}
    .emergency-route-box small{font-size:8px;font-weight:900}
    .emergency-route-box strong{display:block;margin-top:4px;font-size:13px;line-height:1.6}
    .hotline-grid{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .hotline{padding:11px;border:1px solid #dce8ef;border-radius:12px;background:#f7fbfd;text-decoration:none;color:#204662;text-align:center}
    .hotline small{color:#708598;font-size:8px}
    .hotline strong{display:block;margin-top:4px;font-size:14px}

    .about-section{margin-top:18px;padding:30px;border-radius:26px}
    .about-header{max-width:900px;margin:auto;text-align:center}
    .about-label{display:inline-block;padding:7px 12px;border-radius:999px;background:#eaf6fb;color:#28658d;font-size:9px;font-weight:900}
    .about-header h2{margin:12px 0 9px;color:#153d61;font-size:29px;font-weight:950}
    .about-header p,.about-info p,.about-emergency p,.about-note{color:#5d758a;font-size:12px;line-height:2;font-family:"Noto Sans Bengali","Nirmala UI",sans-serif}
    .about-info{margin-top:24px;padding:19px;border:1px solid #dceaf1;border-radius:17px;background:#f6fafc}
    .about-info h3,.about-emergency h3{margin:0 0 9px;color:#173e61;font-size:17px;font-weight:900}
    .sdg-title{margin:25px 0 14px;color:#173e61;font-size:20px;font-weight:950;text-align:center}
    .sdg-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .sdg-card{padding:17px;border-radius:16px;border:1px solid}
    .sdg-3{background:#f0f9ff;border-color:#d5eaf5}
    .sdg-5{background:#fff5fa;border-color:#f0dce7}
    .sdg-11{background:#f0fbf5;border-color:#d7ecdf}
    .sdg-16{background:#fffaf1;border-color:#efe0bd}
    .sdg-number{font-size:23px;font-weight:950}
    .sdg-3 .sdg-number{color:#0b6a9d}
    .sdg-5 .sdg-number{color:#bf4172}
    .sdg-11 .sdg-number{color:#188250}
    .sdg-16 .sdg-number{color:#b77807}
    .sdg-card h4{margin:6px 0 8px;color:#183e60;font-size:12px;line-height:1.6}
    .sdg-card p{margin:0;color:#61788c;font-size:10px;line-height:1.8}
    .about-emergency{margin-top:22px;padding:18px;border:1px solid #daeaf0;border-radius:16px;background:linear-gradient(135deg,#eef8fc,#f2faf5)}
    .about-note{margin-top:15px;text-align:center;font-size:9px}

    .profile-menu{position:fixed;top:76px;right:24px;z-index:2500;width:300px;max-width:calc(100vw - 24px);padding:17px;border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 18px 40px rgba(20,68,102,.18)}
    .profile-name{color:#183d60;font-size:16px;font-weight:950}
    .profile-line{margin-top:6px;color:#60798e;font-size:9px;line-height:1.5;overflow-wrap:anywhere}
    .profile-logout{width:100%;margin-top:12px;height:38px;border:0;border-radius:10px;background:#fee2e2;color:#b91c1c;font-weight:900}

    .sos-panel{position:fixed;left:24px;bottom:22px;z-index:2800;width:min(390px,calc(100vw - 48px));padding:17px;border-radius:22px;background:rgba(255,248,249,.98);border:1px solid #fecaca;box-shadow:0 18px 40px rgba(120,20,35,.2)}
    .sos-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .sos-title{color:#991b1b;font-size:16px;font-weight:950}
    .sos-live{padding:5px 8px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:8px;font-weight:900}
    .sos-location{margin-top:10px;padding:11px;border:1px solid #fecaca;border-radius:12px;background:white;color:#7f1d1d;font-size:9px;line-height:1.7;overflow-wrap:anywhere}
    .sos-actions{margin-top:9px;display:grid;grid-template-columns:1fr 1fr;gap:7px}
    .sos-actions button,.sos-actions a{min-height:38px;display:grid;place-items:center;padding:6px;border:1px solid #fecaca;border-radius:10px;background:white;color:#991b1b;text-decoration:none;font-size:9px;font-weight:900}
    .sos-actions button:disabled{opacity:.5;cursor:not-allowed}

    .auth-overlay{position:fixed;inset:0;z-index:4000;display:grid;place-items:center;padding:20px;background:rgba(8,25,44,.46);backdrop-filter:blur(5px)}
    .auth-modal{width:min(700px,100%);max-height:90vh;overflow:auto;padding:25px;border-radius:24px;background:white;box-shadow:0 25px 60px rgba(5,25,45,.28)}
    .auth-close{display:block;margin-left:auto;width:65px;height:34px;border:0;border-radius:10px;background:#eff4f7;color:#38566d;font-size:10px;font-weight:800}
    .auth-logo{display:block;width:170px;height:70px;object-fit:contain;margin:3px auto 5px}
    .auth-title{text-align:center;color:#173d60;font-size:22px;font-weight:950}
    .auth-sub{margin-top:4px;text-align:center;color:#6b8398;font-size:10px}
    .auth-form{margin-top:16px;display:grid;gap:10px}
    .auth-label{display:grid;gap:5px;color:#4e6980;font-size:9px;font-weight:850}
    .auth-input,.auth-textarea{width:100%;min-height:41px;padding:0 11px;border:1px solid #d9e5ed;border-radius:10px;background:#f9fcfe;outline:none;color:#183d60}
    .auth-textarea{min-height:70px;padding-top:10px;resize:vertical}
    .auth-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .auth-section-title{color:#183e61;font-size:10px;font-weight:950}
    .auth-error{padding:9px 11px;border-radius:9px;background:#fff1f2;color:#be123c;font-size:9px;font-weight:800;line-height:1.6}
    .auth-submit{height:43px;border:0;border-radius:11px;background:linear-gradient(135deg,#0b619d,#1977b4);color:white;font-weight:900}
    .auth-switch{margin-top:11px;text-align:center;color:#6d8398;font-size:9px}
    .auth-switch button{border:0;background:none;color:#0b69a3;font-weight:900}

    @media(max-width:1100px){
      .workspace{grid-template-columns:1fr}
      .map-area{height:560px}
      .sdg-grid{grid-template-columns:1fr 1fr}
    }

    @media(max-width:760px){
      .topbar{height:76px}
      .topbar-inner{padding:0 12px;gap:6px}
      .brand img{width:128px;height:62px}
      .main-nav{gap:2px}
      .main-nav a{display:none}
      .language-btn{padding:0 9px;height:36px}
      .header-actions{margin-left:auto;gap:5px}
      .account-btn{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 9px}
      .emergency-header{padding:0 10px;font-size:10px}
      .status-pill{display:none}
      .page{padding:18px 12px 32px}
      .hero h1{font-size:31px}
      .hero p{font-size:13px}
      .search-grid,.controls-row{grid-template-columns:1fr}
      .primary-btn{width:100%}
      .map-area{height:450px}
      .sdg-grid{grid-template-columns:1fr}
      .auth-two{grid-template-columns:1fr}
      .about-section{padding:20px 15px}
      .sos-panel{left:12px;right:12px;bottom:12px;width:auto}
    }
  `;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="pothik-app">
      <style>{styles}</style>

      {/* HEADER */}

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <img
              src="/pothik-logo.png"
              alt="Pothik"
            />
          </div>

          <nav className="main-nav">
            <a href="#home" className="active">
              {t.home}
            </a>

            <a href="#about">
              {t.about}
            </a>

            <button
              className="language-btn"
              onClick={() =>
                setLanguage((previous) =>
                  previous === "bn"
                    ? "en"
                    : "bn"
                )
              }
            >
              {t.languageSwitch}
            </button>
          </nav>

          <div className="header-actions">
            {!currentUser ? (
              <button
                className="account-btn"
                onClick={() => openAuth("login")}
              >
                {t.login}
              </button>
            ) : (
              <button
                className="account-btn"
                onClick={() =>
                  setProfileOpen((previous) => !previous)
                }
              >
                {currentUser.fullName}
              </button>
            )}

            <button
              className="emergency-header"
              onClick={
                sosActive
                  ? stopSOS
                  : startSOS
              }
            >
              {sosActive
                ? t.stopSOS
                : t.emergency}
            </button>

            <div className="status-pill">
              <span className="status-dot" />
              {safetyMode === "women"
                ? t.womenSafety
                : t.generalSafety}
            </div>
          </div>
        </div>
      </header>

      {/* PROFILE */}

      {profileOpen && currentUser && (
        <div className="profile-menu">
          <div className="profile-name">
            {currentUser.fullName}
          </div>

          <div className="profile-line">
            {t.email}: {currentUser.email}
          </div>

          <div className="profile-line">
            {t.phone}: {currentUser.phone}
          </div>

          <div className="profile-line">
            {t.address}: {currentUser.address}
          </div>

          <div className="profile-line">
            {t.emergencyContact}:{" "}
            {currentUser.emergencyContact?.name}
          </div>

          <div className="profile-line">
            {t.emergencyPhone}:{" "}
            {currentUser.emergencyContact?.phone}
          </div>

          <button
            className="profile-logout"
            onClick={logout}
          >
            {t.logout}
          </button>
        </div>
      )}

      <main className="page" id="home">
        {/* HERO */}

        <section className="hero">
          <div className="hero-tag">
            {t.smartMobility}
          </div>

          <h1>{t.heroTitle}</h1>

          <p>{t.heroSubtitle}</p>
        </section>

        {/* LOCATION SEARCH */}

        <section className="search-panel glass">
          <div className="search-grid">
            {/* START */}

            <div className="field">
              <label htmlFor="pothik-start">
                {t.from}
              </label>

              <div className="input-wrap">
                <input
                  id="pothik-start"
                  className="location-input"
                  value={visibleStartText}
                  onChange={(event) =>
                    handleStartInput(event.target.value)
                  }
                  onFocus={() =>
                    setActiveField("start")
                  }
                  placeholder={t.startPlaceholder}
                  autoComplete="off"
                />

                <button
                  type="button"
                  className="current-location-btn"
                  title={t.currentLocation}
                  onClick={getCurrentLocation}
                >
                  ◎
                </button>
              </div>

              {usingCurrentLocation && (
                <div className="current-location-info">
                  ✓ {t.currentLocationSelected}
                </div>
              )}

              {activeField === "start" &&
                (startSuggestions.length > 0 ||
                  startSuggestLoading) && (
                  <div className="suggestions-box">
                    <div className="suggestions-title">
                      {t.suggestions}
                    </div>

                    {startSuggestLoading &&
                      startSuggestions.length === 0 && (
                        <div className="suggestion-loading">
                          {t.searching}
                        </div>
                      )}

                    {startSuggestions.map((place) => (
                      <button
                        type="button"
                        key={place.id}
                        className="suggestion-item"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          choosePlace(place, "start");
                        }}
                      >
                        <div className="suggestion-name">
                          {place.displayName}
                        </div>

                        <div className="suggestion-source">
                          {t.placeSource}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* DESTINATION */}

            <div className="field">
              <label htmlFor="pothik-destination">
                {t.destination}
              </label>

              <div className="input-wrap">
                <input
                  id="pothik-destination"
                  className="location-input"
                  value={destinationText}
                  onChange={(event) =>
                    handleDestinationInput(
                      event.target.value
                    )
                  }
                  onFocus={() =>
                    setActiveField("destination")
                  }
                  placeholder={t.destinationPlaceholder}
                  autoComplete="off"
                />
              </div>

              {activeField === "destination" &&
                (destinationSuggestions.length > 0 ||
                  destinationSuggestLoading) && (
                  <div className="suggestions-box">
                    <div className="suggestions-title">
                      {t.suggestions}
                    </div>

                    {destinationSuggestLoading &&
                      destinationSuggestions.length === 0 && (
                        <div className="suggestion-loading">
                          {t.searching}
                        </div>
                      )}

                    {destinationSuggestions.map((place) => (
                      <button
                        type="button"
                        key={place.id}
                        className="suggestion-item"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          choosePlace(
                            place,
                            "destination"
                          );
                        }}
                      >
                        <div className="suggestion-name">
                          {place.displayName}
                        </div>

                        <div className="suggestion-source">
                          {t.placeSource}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <button
              className="primary-btn"
              onClick={handleFindRoute}
              disabled={loading}
            >
              {loading
                ? t.calculating
                : t.findRoute}
            </button>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* SAFETY CONTROLS */}

          <div className="controls-row">
            <div className="control-block">
              <div className="control-title">
                {t.safetyMode}
              </div>

              <div className="control-sub">
                {t.safetyModeSub}
              </div>

              <div className="segmented">
                <button
                  className={`control-btn ${
                    safetyMode === "general"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSafetyMode("general")
                  }
                >
                  {t.generalSafety}
                </button>

                <button
                  className={`control-btn ${
                    safetyMode === "women"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSafetyMode("women")
                  }
                >
                  {t.womenSafety}
                </button>
              </div>

              <div className="mode-highlight">
                {safetyMode === "women"
                  ? t.womenSafetyInfo
                  : t.generalSafetyInfo}
              </div>
            </div>

            <div className="control-block">
              <div className="control-title">
                {t.travelTime}
              </div>

              <div className="control-sub">
                {t.travelTimeSub}
              </div>

              <div className="segmented">
                <button
                  className={`control-btn ${
                    travelMode === "day"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setTravelMode("day")
                  }
                >
                  {t.day}
                </button>

                <button
                  className={`control-btn ${
                    travelMode === "night"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setTravelMode("night")
                  }
                >
                  {t.night}
                </button>
              </div>

              <div
                className="control-title"
                style={{ marginTop: 9 }}
              >
                {t.weather}
              </div>

              <div className="segmented">
                <button
                  className={`control-btn ${
                    weatherMode === "clear"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setWeatherMode("clear")
                  }
                >
                  {t.clear}
                </button>

                <button
                  className={`control-btn ${
                    weatherMode === "rain"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setWeatherMode("rain")
                  }
                >
                  {t.rain}
                </button>

                <button
                  className={`control-btn ${
                    weatherMode === "heavyRain"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setWeatherMode("heavyRain")
                  }
                >
                  {t.heavyRain}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MAP AND SIDE PANELS */}

        <section className="workspace">
          <RouteMap
            center={mapCenter}
            start={start}
            destination={destination}
            hasStart={hasStart}
            hasDestination={hasDestination}
            startText={visibleStartText || startText}
            destinationText={destinationText}
            routes={analyzedRoutes}
            emergencyRoute={emergencyRoute}
            selectedEmergency={selectedEmergency}
            selectedRouteId={selectedRouteId}
            onRouteSelect={setSelectedRouteId}
            language={language}
          />

          <aside className="right-column">
            {/* NORMAL ROUTES */}

            {!emergencyRoute && (
              <div className="route-options">
                <div className="card-row">
                  <div className="card-title">
                    {t.routeOptions}
                  </div>

                  <div className="card-tag">
                    {analyzedRoutes.length}{" "}
                    {t.routes}
                  </div>
                </div>

                <div className="section-small">
                  {t.availableRoutes}
                </div>

                {analyzedRoutes.length === 0 && (
                  <div className="recommendation">
                    {t.selectPlace}
                  </div>
                )}

                {analyzedRoutes.map((route) => {
                  const badges = [];

                  if (fastestRoute?.id === route.id) {
                    badges.push(t.fastest);
                  }

                  if (safestRoute?.id === route.id) {
                    badges.push(t.safest);
                  }

                  if (balancedRoute?.id === route.id) {
                    badges.push(t.balanced);
                  }

                  return (
                    <button
                      key={route.id}
                      className={`route-card ${
                        selectedRouteId === route.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedRouteId(route.id)
                      }
                    >
                      <div className="route-top">
                        <div>
                          <div className="route-label">
                            {routeLabel(route.id)}
                          </div>

                          <div className="route-name">
                            {routeLabel(route.id)}
                          </div>

                          <div className="route-badges">
                            {badges.map((badge) => (
                              <span
                                key={badge}
                                className="route-badge"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="route-score">
                          {route.safetyScore}
                        </div>
                      </div>

                      <div className="route-meta">
                        <span>
                          {formatDuration(
                            route.duration,
                            language
                          )}
                        </span>

                        <span>
                          {route.distance}{" "}
                          {language === "bn"
                            ? "কিমি"
                            : "km"}
                        </span>

                        <span>
                          {route.safetyScore}/100
                        </span>
                      </div>
                    </button>
                  );
                })}

                {balancedRoute && (
                  <div className="recommendation">
                    <strong>
                      {t.recommendation}
                    </strong>{" "}
                    {routeLabel(balancedRoute.id)}{" "}
                    {t.balanceText}
                  </div>
                )}
              </div>
            )}

            {/* EMERGENCY ROUTE DETAILS */}

            {emergencyRoute && (
              <div className="side-card">
                <div className="card-row">
                  <div className="card-title">
                    {t.emergencyNavigation}
                  </div>

                  <div
                    className="card-tag"
                    style={{
                      background: "#cffafe",
                      color: "#0e7490",
                    }}
                  >
                    {t.active}
                  </div>
                </div>

                <p className="control-sub">
                  {t.emergencyRouteOnly}
                </p>

                <div className="emergency-route-box">
                  <small>
                    {t.routeToService}
                  </small>

                  <strong>
                    {t.currentLocation} →{" "}
                    {selectedEmergency?.name}
                  </strong>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 9,
                    }}
                  >
                    {selectedEmergency?.distance?.toFixed(1)}{" "}
                    {language === "bn"
                      ? "কিমি সরলরেখায়"
                      : "km straight-line distance"}
                    {" · "}
                    {emergencyRoute.distance}{" "}
                    {language === "bn"
                      ? "কিমি সড়কপথ"
                      : "km road distance"}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 9,
                    }}
                  >
                    {formatDuration(
                      emergencyRoute.duration,
                      language
                    )}
                  </div>
                </div>

                <button
                  className="primary-btn"
                  style={{
                    width: "100%",
                    marginTop: 10,
                  }}
                  onClick={exitEmergencyMode}
                >
                  {t.backNormal}
                </button>
              </div>
            )}

            {/* SAFETY ANALYSIS */}

            {activeRoute && !emergencyRoute && (
              <div className="side-card">
                <div className="card-row">
                  <div className="card-title">
                    {t.safetyAnalysis}
                  </div>

                  <div>
                    <div
                      className="score"
                      style={{
                        color: getSafetyColor(
                          activeRoute.safetyScore
                        ),
                      }}
                    >
                      {activeRoute.safetyScore}
                    </div>

                    <div className="score-sub">
                      {t.outOf100}
                    </div>
                  </div>
                </div>

                <div
                  className="status"
                  style={{
                    background: `${getSafetyColor(
                      activeRoute.safetyScore
                    )}18`,

                    color: getSafetyColor(
                      activeRoute.safetyScore
                    ),
                  }}
                >
                  {safetyStatus(
                    activeRoute.safetyScore
                  )}
                </div>

                <div className="reason-box">
                  <strong>
                    {routeLabel(activeRoute.id)}
                  </strong>{" "}
                  {t.selectedRouteText}
                </div>

                <div className="reason-list">
                  {routeReasons.map((reason) => (
                    <div
                      key={reason}
                      className="reason"
                    >
                      <span className="check">
                        ✓
                      </span>

                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {factorItems.map((factor) => (
                  <div
                    key={factor.label}
                    className="factor"
                  >
                    <div className="factor-top">
                      <span>
                        {factor.label}
                      </span>

                      <span className="factor-value">
                        {factor.value}
                      </span>
                    </div>

                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${clamp(
                            (factor.value /
                              factor.max) *
                              100,
                            0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NEAREST EMERGENCY SERVICES */}

            <div className="side-card">
              <div className="card-title">
                {t.emergencyServices}
              </div>

              <div className="control-sub">
                {t.emergencyServicesSub}
              </div>

              <div className="emergency-list">
                {[
                  "Hospital",
                  "Police",
                  "Fire Station",
                ].map((type) => (
                  <button
                    key={type}
                    className="service-btn"
                    disabled={emergencyLoading}
                    onClick={() =>
                      handleEmergencyRoute(type)
                    }
                  >
                    <div className="service-left">
                      <div className="service-name">
                        {getEmergencyTitle(type)}
                      </div>

                      <div className="service-sub">
                        {emergencyLoading
                          ? t.searchingEmergency
                          : t.getRoute}
                      </div>
                    </div>

                    <div
                      className="service-arrow"
                      style={{
                        color:
                          type === "Hospital"
                            ? "#dc2626"
                            : type === "Police"
                            ? "#2563eb"
                            : "#ea580c",
                      }}
                    >
                      ›
                    </div>
                  </button>
                ))}
              </div>

              {emergencyError && (
                <div className="error-box">
                  {emergencyError}
                </div>
              )}
            </div>

            {/* HOTLINES */}

            <div className="side-card">
              <div className="card-title">
                {t.emergencyHotlines}
              </div>

              <div className="hotline-grid">
                <a
                  href="tel:999"
                  className="hotline"
                >
                  <small>
                    {t.nationalEmergency}
                  </small>

                  <strong>999</strong>
                </a>

                <a
                  href="tel:16263"
                  className="hotline"
                >
                  <small>
                    {t.healthService}
                  </small>

                  <strong>16263</strong>
                </a>
              </div>

              <button
                className="primary-btn"
                style={{
                  width: "100%",
                  marginTop: 10,
                }}
                disabled={emergencyLoading}
                onClick={() =>
                  handleEmergencyRoute("Hospital")
                }
              >
                {t.findNearestHospital}
              </button>
            </div>
          </aside>
        </section>

        <AboutSection language={language} />
        <SafetyHazardReport language={language} />
      </main>

      {/* SOS PANEL */}

      {sosActive && (
        <div className="sos-panel">
          <div className="sos-head">
            <div className="sos-title">
              {t.sosActive}
            </div>

            <div className="sos-live">
              {t.liveLocation}
            </div>
          </div>

          <div className="sos-location">
            {sosLocation ? (
              <>
                {t.latitude}:{" "}
                {sosLocation.latitude.toFixed(6)}
                <br />

                {t.longitude}:{" "}
                {sosLocation.longitude.toFixed(6)}
                <br />

                {t.accuracy}:{" "}
                {sosLocation.accuracy}{" "}
                {language === "bn"
                  ? "মিটার"
                  : "meters"}
                <br />

                {t.updated}:{" "}
                {new Date(
                  sosLocation.timestamp
                ).toLocaleTimeString(
                  language === "bn"
                    ? "bn-BD"
                    : "en-US"
                )}
              </>
            ) : (
              t.gettingLocation
            )}
          </div>

          {sosError && (
            <div className="error-box">
              {sosError}
            </div>
          )}

          <div className="sos-actions">
            <button onClick={callEmergencyContact}>
              {t.callContact}
            </button>

            <button
              onClick={sendLocationSMS}
              disabled={!sosLocation}
            >
              {t.sendLocation}
            </button>

            {sosLocation && (
              <a
                href={locationUrl(
                  sosLocation.latitude,
                  sosLocation.longitude
                )}
                target="_blank"
                rel="noreferrer"
              >
                {t.openLocation}
              </a>
            )}

            <button onClick={stopSOS}>
              {t.stopSOS}
            </button>
          </div>
        </div>
      )}

      {/* LOGIN / REGISTRATION */}

      {authView && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAuth();
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={closeAuth}
            >
              {t.close}
            </button>

            <img
              src="/pothik-logo.png"
              alt="Pothik"
              className="auth-logo"
            />

            {authView === "login" ? (
              <>
                <div className="auth-title">
                  {t.welcome}
                </div>

                <div className="auth-sub">
                  {t.loginSub}
                </div>

                <form
                  className="auth-form"
                  onSubmit={handleLogin}
                >
                  <label className="auth-label">
                    {t.email} / {t.phone}

                    <input
                      className="auth-input"
                      value={loginForm.identifier}
                      onChange={(event) =>
                        setLoginForm((previous) => ({
                          ...previous,
                          identifier:
                            event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="auth-label">
                    {t.password}

                    <input
                      className="auth-input"
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((previous) => ({
                          ...previous,
                          password:
                            event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  {authError && (
                    <div className="auth-error">
                      {authError}
                    </div>
                  )}

                  <button
                    className="auth-submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? t.signingIn
                      : t.signIn}
                  </button>
                </form>

                <div className="auth-switch">
                  {t.noAccount}{" "}

                  <button
                    type="button"
                    onClick={() =>
                      openAuth("register")
                    }
                  >
                    {t.register}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="auth-title">
                  {t.register}
                </div>

                <div className="auth-sub">
                  {t.personalInfo} · {t.emergencyContact}
                </div>

                <form
                  className="auth-form"
                  onSubmit={handleRegister}
                >
                  <div className="auth-section-title">
                    {t.personalInfo}
                  </div>

                  <label className="auth-label">
                    {t.fullName}

                    <input
                      className="auth-input"
                      value={registerForm.fullName}
                      onChange={(event) =>
                        setRegisterForm((previous) => ({
                          ...previous,
                          fullName:
                            event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <div className="auth-two">
                    <label className="auth-label">
                      {t.email}

                      <input
                        className="auth-input"
                        type="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            email:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>

                    <label className="auth-label">
                      {t.phone}

                      <input
                        className="auth-input"
                        value={registerForm.phone}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            phone:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  <label className="auth-label">
                    {t.address}

                    <textarea
                      className="auth-textarea"
                      value={registerForm.address}
                      onChange={(event) =>
                        setRegisterForm((previous) => ({
                          ...previous,
                          address:
                            event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <div className="auth-two">
                    <label className="auth-label">
                      {t.password}

                      <input
                        className="auth-input"
                        type="password"
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            password:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>

                    <label className="auth-label">
                      {t.confirmPassword}

                      <input
                        className="auth-input"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            confirmPassword:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  <div className="auth-section-title">
                    {t.emergencyContact}
                  </div>

                  <div className="auth-two">
                    <label className="auth-label">
                      {language === "bn"
                        ? "নাম"
                        : "Name"}

                      <input
                        className="auth-input"
                        value={registerForm.emergencyName}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            emergencyName:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>

                    <label className="auth-label">
                      {t.relationship}

                      <input
                        className="auth-input"
                        value={registerForm.emergencyRelationship}
                        onChange={(event) =>
                          setRegisterForm((previous) => ({
                            ...previous,
                            emergencyRelationship:
                              event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  <label className="auth-label">
                    {t.emergencyPhone}

                    <input
                      className="auth-input"
                      value={registerForm.emergencyPhone}
                      onChange={(event) =>
                        setRegisterForm((previous) => ({
                          ...previous,
                          emergencyPhone:
                            event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  {authError && (
                    <div className="auth-error">
                      {authError}
                    </div>
                  )}

                  <button
                    className="auth-submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? t.creatingAccount
                      : t.register}
                  </button>
                </form>

                <div className="auth-switch">
                  {t.hasAccount}{" "}

                  <button
                    type="button"
                    onClick={() =>
                      openAuth("login")
                    }
                  >
                    {t.signIn}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}