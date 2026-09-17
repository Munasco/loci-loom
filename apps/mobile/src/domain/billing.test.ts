import { DemoBillingGateway } from './billing';
it('unlocks Scholar access after a demo purchase', async () => { const billing = new DemoBillingGateway(); expect(await billing.getAccess()).toBe('free'); expect(await billing.purchaseScholarPass()).toBe('scholar'); expect(await billing.restore()).toBe('scholar'); });
