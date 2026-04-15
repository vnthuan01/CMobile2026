import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getCampaignDetail,
  createDonationCheckout,
  DonationStatus,
  getCampaignDonationSummary,
  getCampaigns,
  getDonationStatus,
  getFundContributions,
  getFundraisingCampaigns,
  getVolunteerRegistrationCampaigns,
  type CampaignListParams,
  type DonationCheckoutPayload,
} from '../services/donationService';
import { showApiErrorToast } from '../utils/apiToast';

export const donationKeys = {
  all: ['donation'] as const,
  campaigns: (params?: CampaignListParams) =>
    ['donation', 'campaigns', params ?? {}] as const,
  fundraisingCampaigns: ['donation', 'fundraising-campaigns'] as const,
  volunteerRegistrationCampaigns: ['donation', 'volunteer-registration-campaigns'] as const,
  campaignDetail: (campaignId: string) => ['donation', 'campaign-detail', campaignId] as const,
  contributions: ['donation', 'fund-contributions'] as const,
  campaignSummary: (campaignId: string) => ['donation', 'campaign-summary', campaignId] as const,
  status: (donationId: string) => ['donation', 'status', donationId] as const,
};

export function useCampaigns(params?: CampaignListParams, enabled = true) {
  return useQuery({
    queryKey: donationKeys.campaigns(params),
    queryFn: () => getCampaigns(params),
    enabled,
  });
}

export function useFundraisingCampaigns() {
  return useQuery({
    queryKey: donationKeys.fundraisingCampaigns,
    queryFn: () => getFundraisingCampaigns(),
  });
}

export function useVolunteerRegistrationCampaigns(enabled = true) {
  return useQuery({
    queryKey: donationKeys.volunteerRegistrationCampaigns,
    queryFn: () => getVolunteerRegistrationCampaigns(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCampaignDetail(campaignId?: string, enabled = true) {
  return useQuery({
    queryKey: donationKeys.campaignDetail(campaignId || ''),
    queryFn: () => getCampaignDetail(campaignId || ''),
    enabled: enabled && !!campaignId,
    staleTime: 0,
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
      mutationFn: (payload: DonationCheckoutPayload) => createDonationCheckout(payload),
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
