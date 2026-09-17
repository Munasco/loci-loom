import type { AccessState, BillingGateway } from '../domain/billing';

const ENTITLEMENT = 'scholar';
type CustomerInfoLike = { entitlements: { active: Record<string, unknown> } };
type PackageLike = unknown;

export type RevenueCatSdk = {
  configure(config: { apiKey: string }): void;
  getCustomerInfo(): Promise<CustomerInfoLike>;
  getOfferings(): Promise<{ current: null | { annual?: PackageLike | null; availablePackages: PackageLike[] } }>;
  purchasePackage(product: PackageLike): Promise<{ customerInfo: CustomerInfoLike }>;
  restorePurchases(): Promise<CustomerInfoLike>;
};

export class RevenueCatBillingGateway implements BillingGateway {
  constructor(apiKey: string, private sdk: RevenueCatSdk) {
    this.sdk.configure({ apiKey });
  }

  async getAccess(): Promise<AccessState> {
    const customer = await this.sdk.getCustomerInfo();
    return customer.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }

  async purchaseScholarPass(): Promise<AccessState> {
    const offerings = await this.sdk.getOfferings();
    const product = offerings.current?.annual ?? offerings.current?.availablePackages[0];
    if (!product) throw new Error('Scholar Pass is not available yet.');
    const { customerInfo } = await this.sdk.purchasePackage(product);
    return customerInfo.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }

  async restore(): Promise<AccessState> {
    const customer = await this.sdk.restorePurchases();
    return customer.entitlements.active[ENTITLEMENT] ? 'scholar' : 'free';
  }
}
