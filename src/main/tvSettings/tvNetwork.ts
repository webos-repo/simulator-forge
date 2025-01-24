/* eslint-disable prefer-const */

import { emtSetting } from '../module/eventEmitters';
import dns from 'dns';
import network from 'network';
import type { NetworkInfoType } from '@service/lunaService/ConnectionManager/types';

let isWired = true;
let networkInfo: NetworkInfoType = {
  state: 'disconnected',
};

class TVNetwork {
  get networkInfo() {
    return {
      isWired,
      networkInfo,
    };
  }

  updateNetworkInfo = async () => {
    network.get_active_interface(async (err: any, info: any) => {
      networkInfo = {
        state: 'disconnected',
      };

      if (err) return;

      networkInfo.state = 'connected';
      networkInfo.interfaceName = info.name;
      networkInfo.ipAddress = info.ip_address;
      networkInfo.netmask = info.netmask;
      networkInfo.gateway = info.gateway_ip;
      networkInfo.method = 'dhcp';
      networkInfo.onInternet = 'yes';

      isWired = info.type !== 'Wireless';

      const dnsServers = dns.getServers();
      if (dnsServers) {
        if (dnsServers.length > 0) networkInfo.dns1 = dnsServers[0];
        if (dnsServers.length > 1) networkInfo.dns2 = dnsServers[1];
        if (dnsServers.length > 2) networkInfo.dns3 = dnsServers[2];
      }
      emtSetting.emit('network-info-updated');
    });
  };
}

export default TVNetwork;
