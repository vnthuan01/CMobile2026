import api from './api';

export const DonationStatus = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Cancelled: 3,
  Expired: 4,
  Refunded: 5,
} as const;

export const CampaignType = {
  Fundraising: 1,
  Relief: 2,
  Rescue: 3,
} as const;

export const CampaignResourceType = {
  Money: 1,
  Supplies: 2,
  People: 3,
} as const;

export interface CampaignGoal {
  campaignResourceGoalId?: string;
  resourceType: number;
  targetAmount: number;
  receivedAmount?: number;
  isRequired?: boolean;
  isMet?: boolean;
  progressPercent?: number;
}

export interface PublicCampaignSummary {
  campaignId: string;
  name: string;
  description?: string | null;
  type: number;
  status: number;
  startDate: string;
  endDate: string;
  totalMoneyReceived: number;
  totalMoneySpent: number;
  remainingBudget: number;
  peopleTarget: number;
  peopleReached: number;
  procurementOrderCount: number;
  procurementReceivedCount: number;
  procurementEstimatedTotal: number;
  procurementActualTotal: number;
  totalSuppliesPurchasedUnits: number;
  totalSuppliesAllocatedUnits: number;
  goals: CampaignGoal[];
}

export interface CampaignListItem {
  campaignId: string;
  name: string;
  description?: string | null;
  type: number;
  status: number;
  startDate: string;
  endDate: string;
  overallProgressPercent?: number;
}

export interface CampaignListResponse {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CampaignListItem[];
}

export interface DonationCheckoutPayload {
  campaignId: string;
  amount: number;
  donorName: string;
  message?: string;
}

export interface DonationCheckoutResponse {
  donationId: string;
  orderCode: number;
  paymentLinkId?: string | null;
  checkoutUrl: string;
  expiresAt: string;
  status: number;
}

export interface DonationStatusResponse {
  donationId: string;
  orderCode: number;
  amount: number;
  donorName: string;
  status: number;
  donatedAt: string;
  expiresAt: string;
  processedAt?: string | null;
  checkoutUrl?: string | null;
}

export interface FundContribution {
  contributionId?: string;
  amount?: number;
  donorName?: string;
  campaignId?: string;
  campaignName?: string;
  createdAt?: string;
  note?: string;
}

export async function getCampaignDonationSummary(campaignId: string) {
  const response = await api.get<PublicCampaignSummary>(
    `/campaigns/${campaignId}/summary`,
  );
  return response.data;
}

export async function getFundraisingCampaigns() {
  const response = await api.get<CampaignListResponse>('/campaigns', {
    params: {
      PageIndex: 1,
      PageSize: 20,
      Type: CampaignType.Fundraising,
    },
  });
  return response.data;
}

export async function createDonationCheckout(payload: DonationCheckoutPayload) {
  const response = await api.post<DonationCheckoutResponse>(
    '/donations/checkout',
    payload,
  );
  return response.data;
}

export async function getDonationStatus(donationId: string) {
  const response = await api.get<DonationStatusResponse>(
    `/donations/${donationId}/status`,
  );
  return response.data;
}

export async function getFundContributions() {
  const response = await api.get<FundContribution[]>('/funds/contributions');
  return response.data;
}
