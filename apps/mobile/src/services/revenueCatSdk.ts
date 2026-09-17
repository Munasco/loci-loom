import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { RevenueCatBillingGateway, type RevenueCatSdk } from './revenueCatBilling';

export function createRevenueCatBilling(apiKey: string) {
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  return new RevenueCatBillingGateway(apiKey, Purchases as unknown as RevenueCatSdk);
}
