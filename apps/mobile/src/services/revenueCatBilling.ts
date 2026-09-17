import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { AccessState, BillingGateway } from '../domain/billing';

const ENTITLEMENT = 'scholar';

export class RevenueCatBillingGateway implements BillingGateway {
  constructor(apiKey: string) {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
  }

  async getAccess(): Promise<AccessState> {
    const customer = await Purchases.getCustomerInfo();
    return customer.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }

  async purchaseScholarPass(): Promise<AccessState> {
    const offerings = await Purchases.getOfferings();
    const product = offerings.current?.annual ?? offerings.current?.availablePackages[0];
    if (!product) throw new Error('Scholar Pass is not available yet.');
    const { customerInfo } = await Purchases.purchasePackage(product);
    return customerInfo.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }

  async restore(): Promise<AccessState> {
    const customer = await Purchases.restorePurchases();
    return customer.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }
}
