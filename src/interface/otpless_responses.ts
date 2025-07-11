export interface SessionData {
  sessionToken: string;
  userId: string;
  startedAt: number;
  lastActiveAt: number;
  identities: Identity[];
  deviceInfo: DeviceInfo;
  network: Network;
}

interface Identity {
  identityType: string;
  identityValue: string;
  channel: string;
  methods: string[];
  name: string;
  verifiedAt: number;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  vendor: string;
  browser: string;
  connection: string;
  language: string;
  cookieEnabled: boolean;
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  devicePixelRatio: number;
  timezoneOffset: number;
  cpuArchitecture: string;
  fontFamily: string;
}

interface Network {
  ip: string;
  timezone: string;
  ipLocation: IpLocation;
}

interface IpLocation {
  city: LocationDetail;
  subdivisions: Subdivision;
  country: Country;
  continent: Continent;
  latitude: number;
  longitude: number;
  postalCode: string;
}

interface LocationDetail {
  name: string;
}

interface Subdivision {
  code: string;
  name: string;
}

interface Country {
  code: string;
  name: string;
}

interface Continent {
  code: string;
}
