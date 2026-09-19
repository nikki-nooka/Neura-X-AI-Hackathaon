export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  population?: number;
  congestionIndex?: number;
  trafficStatus?: 'Gridlock' | 'Heavy' | 'Moderate' | 'Flowing' | string;
}

export const majorCities: City[] = [
  { name: 'Hyderabad', country: 'India', lat: 17.385, lng: 78.4867, population: 10534000, congestionIndex: 68, trafficStatus: 'Heavy' },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, population: 3331000, congestionIndex: 54, trafficStatus: 'Moderate' },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, population: 12765000, congestionIndex: 82, trafficStatus: 'Gridlock' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, population: 9304000, congestionIndex: 72, trafficStatus: 'Heavy' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, population: 37400068, congestionIndex: 45, trafficStatus: 'Moderate' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, population: 5686000, congestionIndex: 38, trafficStatus: 'Flowing' },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, population: 18804000, congestionIndex: 78, trafficStatus: 'Heavy' },
  { name: 'Bertoua', country: 'Cameroon', lat: 4.5773, lng: 13.6846, population: 218000, congestionIndex: 42, trafficStatus: 'Flowing' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, population: 15388000, congestionIndex: 88, trafficStatus: 'Gridlock' },
  { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209, population: 30290936, congestionIndex: 76, trafficStatus: 'Heavy' },
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, population: 20411274, congestionIndex: 84, trafficStatus: 'Gridlock' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 2161000, congestionIndex: 59, trafficStatus: 'Moderate' },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, population: 3645000, congestionIndex: 41, trafficStatus: 'Flowing' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, population: 5312000, congestionIndex: 50, trafficStatus: 'Moderate' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, population: 2930000, congestionIndex: 62, trafficStatus: 'Moderate' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, population: 22043028, congestionIndex: 79, trafficStatus: 'Heavy' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, population: 3898000, congestionIndex: 74, trafficStatus: 'Heavy' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, population: 20900604, congestionIndex: 70, trafficStatus: 'Heavy' }
];
