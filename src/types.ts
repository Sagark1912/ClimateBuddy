export type Language = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';

export interface LocationProfile {
  id: string;
  name: string;
  areaName?: string;
  subLocality?: string;
  city?: string;
  state: string;
  country?: string;
  regionType: 'metro' | 'urban' | 'rural_agri' | 'coastal';
  lat: number;
  lng: number;
  elevationMeters: number;
}

export type PersonaType = 'farmer' | 'gig_worker' | 'family' | 'commuter';

export interface FarmerProfile {
  crop: 'paddy' | 'wheat' | 'cotton' | 'sugarcane' | 'vegetables' | 'millets';
  irrigationMethod: 'borewell' | 'canal' | 'drip' | 'rainfed';
  soilType: 'black_cotton' | 'alluvial' | 'red_loamy';
  acres: number;
}

export interface GigWorkerProfile {
  occupation: 'delivery_rider' | 'construction' | 'street_vendor' | 'sanitation';
  shiftStart: string;
  shiftEnd: string;
  vehicleType: 'two_wheeler' | 'bicycle' | 'on_foot';
  hasHydrationAccess: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'school_child' | 'elderly' | 'working_adult' | 'infant' | 'homemaker';
  departureTime: string;
  returnTime: string;
  sensitivity: 'asthma' | 'heat' | 'uv' | 'general';
}

export interface FamilyProfile {
  hasChildrenInSchool: boolean;
  schoolHours: string;
  hasElderlyOrAsthma: boolean;
  homeType: 'apartment' | 'independent_house';
  hasGardenOrPlants: boolean;
  members: FamilyMember[];
}

export interface CommuterProfile {
  primaryTransit: 'bicycle' | 'metro_bus' | 'two_wheeler' | 'car' | 'walking';
  distanceKm: number;
  commuteTime: string;
}

export interface UserPersona {
  type: PersonaType;
  farmer: FarmerProfile;
  gigWorker: GigWorkerProfile;
  family: FamilyProfile;
  commuter: CommuterProfile;
}

export interface EnvironmentalData {
  locationId: string;
  timestamp: string;
  tempC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirection: string;
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  no2: number;
  uvIndex: number;
  solarRadianceWm2: number;
  rainChancePercent: number;
  rainRateMmPerHour: number;
  soilMoisturePercent: number;
  heatStressWbgt: number; // Wet Bulb Globe Temperature for labor safety
  compositeRiskScore: number; // 0.0 - 10.0 scale
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Severe Hazard';
  cloudCoverPercent?: number;
  cloudCoverLow?: number;
  cloudCoverMid?: number;
  cloudCoverHigh?: number;
  cloudCondition?: string;
  areaMicroclimate?: {
    resolvedArea: string;
    subLocality: string;
    cloudVariancePercent: number;
    areaRainProb: number;
    urbanHeatIslandDeltaC: number;
    localMicroAdvice: string;
    multiSourceConsensus: {
      providerCount: number;
      models: string[];
      agreementScorePercent: number;
      cloudObservation: string;
    };
    nearbyAreasComparison?: {
      areaName: string;
      tempC: number;
      cloudPercent: number;
      rainChance: number;
      condition: string;
    }[];
  };
  activeAlerts: EnvironmentalAlert[];
  feeds: {
    imd: { status: 'active' | 'updating'; station: string; latencyMs: number };
    sentinel5p: { status: 'active'; passTime: string; traceGas: string };
    openaq: { status: 'active'; stationsReporting: number };
    copernicus: { status: 'active'; modelRun: string };
    regionalSensors: { online: number; total: number };
  };
}

export interface EnvironmentalAlert {
  id: string;
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  affectedGroup: string;
  source: 'IMD' | 'CPCB' | 'NDMA' | 'Copernicus';
}

export interface PrescriptiveNudge {
  id: string;
  title: string;
  microPrompt: string;
  personaTarget: PersonaType | 'all';
  confidenceScore: number; // e.g. 92%
  urgency: 'immediate' | 'planning' | 'habit';
  resourceBenefit?: {
    waterSavedL?: number;
    kwhSaved?: number;
    emissionsAvoidedKg?: number;
    moneySavedINR?: number;
  };
  reasoning: string;
  suggestedActionLabel: string;
  actionLoggedType?: string;
}

export interface GreenActionLog {
  id: string;
  title: string;
  category: 'water' | 'energy' | 'transit' | 'cooling' | 'agriculture';
  waterSavedL: number;
  co2AvoidedKg: number;
  kwhSaved: number;
  moneySavedINR: number;
  timestamp: string;
  source: 'nudge' | 'manual';
}

export interface CommunityReport {
  id: string;
  hazardType: 'waterlogging' | 'heat_spot' | 'smog_smoke' | 'fallen_tree' | 'localized_rain';
  locationName: string;
  description: string;
  timestamp: string;
  upvotes: number;
  verified: boolean;
  distanceKm?: number;
}
