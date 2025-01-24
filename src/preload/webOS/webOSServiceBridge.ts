import ApiKeys from '../lib/ApiKeys';
import { functionRunner } from '../lib/functionRunner';

export function makeWebOSServiceBridgeInApp() {
  // [WARNING] Require local copy
  const RootKey = ApiKeys.Root;
  const WebOSServiceBridgeKey = ApiKeys.WebOSServiceBridge;

  functionRunner(
    () => {
      class WebOSServiceBridge {
        static bridgeBaseKey: number = 1;
        bridgeKey: number;
        onservicecallback?: any;

        constructor() {
          this.bridgeKey = WebOSServiceBridge.bridgeBaseKey;
          WebOSServiceBridge.bridgeBaseKey += 1;
        }

        call(url: string, params: string) {
          window[RootKey][WebOSServiceBridgeKey].call(
            this.bridgeKey,
            url,
            params,
            this.onservicecallback
          );
        }
        cancel() {
          window[RootKey][WebOSServiceBridgeKey].cancel(this.bridgeKey);
        }
      }

      window.WebOSServiceBridge = WebOSServiceBridge;
      window.PalmServiceBridge = WebOSServiceBridge;
    },
    {
      replace: {
        RootKey,
        WebOSServiceBridgeKey,
      },
    }
  );
}
