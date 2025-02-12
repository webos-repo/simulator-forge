type ProxyInfoType = {
  method: string;
  url?: string;
  servers?: string[];
  excludes?: string[];
};

type WiredType = {
  state: string;
  plugged: boolean;
  interfaceName?: string;
  ipAddress?: string;
  netmask?: string;
  gateway?: string;
  dns1?: string;
  dns2?: string;
  dns3?: string;
  method?: string;
  onInternet?: string;
  proxyInfo?: ProxyInfoType;
  checkingInternet?: boolean; //  when not connected, is not returned
};

type WifiType = {
  state: string;
  tetheringEnabled: boolean;
  interfaceName?: string;
  ipAddress?: string;
  netmask?: string;
  gateway?: string;
  dns1?: string;
  dns2?: string;
  dns3?: string;
  method?: string;
  ssid?: string;
  isWakeOnWiFiEnabled?: boolean;
  onInternet?: string;
};

// TBU
type WifiDirectType = {
  state: string; // only disconnected
};

type IpInfoType = {
  interface: string;
  address?: string;
  subnet: string;
  gateway: string;
  dns: string[];
};

type ContextInfoType = {
  name: string;
  connected: boolean;
  onInternet: boolean;
  ipv4?: IpInfoType;
  ipv6?: IpInfoType;
};

type WanType = {
  connected: boolean;
  connectedContexts: ContextInfoType[];
};

type CellularType = {
  enabled: boolean;
};

type NapInfoType = {
  address: string;
  name: string;
};

type BluetoothType = {
  state: string;
  tetheringEnabled: boolean;
  nap?: NapInfoType;
  interfaceName?: string;
  ipAddress?: string;
  netmask?: string;
  gateway?: string;
  dns?: string[];
  method?: string;
  onInternet?: string;
};

type ConnectionStatusType = {
  isInternetConnectionAvailable: boolean;
  wired: WiredType;
  wifi: WifiType;
  wifiDirect: WifiDirectType;
  bluetooth: BluetoothType;
  wan: WanType;
  cellular: CellularType;
  offlineMode?: string;
};

type NetworkInfoType = {
  state: string;
  interfaceName?: string;
  ipAddress?: string;
  netmask?: string;
  gateway?: string;
  dns1?: string;
  dns2?: string;
  dns3?: string;
  method?: string;
  onInternet?: string;
  ssid?: string;
};

export type { ConnectionStatusType, NetworkInfoType };
