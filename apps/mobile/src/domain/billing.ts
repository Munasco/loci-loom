export type AccessState = 'free' | 'scholar';
export interface BillingGateway { getAccess(): Promise<AccessState>; purchaseScholarPass(): Promise<AccessState>; restore(): Promise<AccessState>; }
export class DemoBillingGateway implements BillingGateway { private access: AccessState = 'free'; async getAccess() { return this.access; } async purchaseScholarPass() { this.access = 'scholar'; return this.access; } async restore() { return this.access; } }
