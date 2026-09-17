const mockConfigure = jest.fn();
const mockGetCustomerInfo = jest.fn();
const mockGetOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();

import { RevenueCatBillingGateway, type RevenueCatSdk } from './revenueCatBilling';

const freeCustomer = { entitlements: { active: {} } };
const scholarCustomer = { entitlements: { active: { scholar: { identifier: 'scholar' } } } };

beforeEach(() => jest.clearAllMocks());
const sdk = { configure: mockConfigure, getCustomerInfo: mockGetCustomerInfo, getOfferings: mockGetOfferings, purchasePackage: mockPurchasePackage, restorePurchases: mockRestorePurchases } as unknown as RevenueCatSdk;

it('configures RevenueCat with the public SDK key', () => {
  new RevenueCatBillingGateway('test_public_key', sdk);
  expect(mockConfigure).toHaveBeenCalledWith({ apiKey: 'test_public_key' });
});

it('maps active entitlements to Scholar access', async () => {
  mockGetCustomerInfo.mockResolvedValue(scholarCustomer);
  const billing = new RevenueCatBillingGateway('test_public_key', sdk);
  expect(await billing.getAccess()).toBe('scholar');
});

it('purchases the annual package and verifies the resulting entitlement', async () => {
  const annual = { identifier: '$rc_annual' };
  mockGetOfferings.mockResolvedValue({ current: { annual, availablePackages: [annual] } });
  mockPurchasePackage.mockResolvedValue({ customerInfo: scholarCustomer });
  const billing = new RevenueCatBillingGateway('test_public_key', sdk);
  expect(await billing.purchaseScholarPass()).toBe('scholar');
  expect(mockPurchasePackage).toHaveBeenCalledWith(annual);
});

it('fails clearly when no Scholar package is configured', async () => {
  mockGetOfferings.mockResolvedValue({ current: { annual: null, availablePackages: [] } });
  const billing = new RevenueCatBillingGateway('test_public_key', sdk);
  await expect(billing.purchaseScholarPass()).rejects.toThrow('Scholar Pass is not available yet.');
});

it('restores purchases and rechecks the entitlement', async () => {
  mockRestorePurchases.mockResolvedValue(freeCustomer);
  const billing = new RevenueCatBillingGateway('test_public_key', sdk);
  expect(await billing.restore()).toBe('free');
});
