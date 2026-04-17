import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createDonationCheckout,
  DonationStatus,
  getCampaignDonationSummary,
  getDonationStatus,
  getFundContributions,
  getFundraisingCampaigns,
  type DonationCheckoutPayload,
} from '../services/donationService';
import { showApiErrorToast } from '../utils/apiToast';

export const donationKeys = {
  all: ['donation'] as const,
  fundraisingCampaigns: ['donation', 'fundraising-campaigns'] as const,
  contributions: ['donation', 'fund-contributions'] as const,
  campaignSummary: (campaignId: string) =>
    ['donation', 'campaign-summary', campaignId] as const,
  status: (donationId: string) => ['donation', 'status', donationId] as const,
};

export function useFundraisingCampaigns() {
  return useQuery({
    queryKey: donationKeys.fundraisingCampaigns,
    queryFn: () => getFundraisingCampaigns(),
  });
}

export function useFundContributions() {
  return useQuery({
    queryKey: donationKeys.contributions,
    queryFn: () => getFundContributions(),
  });
}

export function useCampaignDonationSummary(campaignId?: string) {
  return useQuery({
    queryKey: donationKeys.campaignSummary(campaignId || ''),
    queryFn: () => getCampaignDonationSummary(campaignId || ''),
    enabled: !!campaignId,
  });
}

export function useCreateDonationCheckout() {
  return useMutation({
    mutationFn: (payload: DonationCheckoutPayload) =>
      createDonationCheckout(payload),
    onError: (error: any) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể tạo thanh toán',
        errorMessage: 'Không thể tạo liên kết thanh toán quyên góp.',
      });
    },
  });
}

export function useDonationStatus(donationId?: string, enabled = true) {
  return useQuery({
    queryKey: donationKeys.status(donationId || ''),
    queryFn: () => getDonationStatus(donationId || ''),
    enabled: enabled && !!donationId,
    refetchInterval: (query: any) => {
      const status = Number(query.state.data?.status ?? -1);
      return status === DonationStatus.Pending ? 5000 : false;
    },
    staleTime: 0,
  });
}
