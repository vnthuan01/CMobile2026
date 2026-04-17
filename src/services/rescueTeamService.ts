import type {
  RescueActiveBatchResponse,
  RescueBatchItem,
  RescueTeamHistoryResponse,
} from '../types/team';
import {
  decodePolyline,
  fetchDirectionsPolyline,
  getMapStyleUrl,
  toMapCoordinate,
} from '../utils/geo';
import { openCallReporter, openExternalNavigation } from '../utils/linking';
import api from './api';

export type {
  RescueActiveBatchResponse,
  RescueBatchItem,
  RescueTeamHistoryBatch,
  RescueTeamHistoryRequestItem,
  RescueTeamHistoryResponse
} from '../types/team';

export const rescueTeamService = {
  getActiveBatchByTeam: async (teamId: string) => {
    try {
      const response = await api.get<RescueActiveBatchResponse>(
        `/RescueRequest/teams/${teamId}/active-batch`,
      );

      const items = [...(response.data.items || [])].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder,
      );

      return {
        success: response.status === 200,
        data: { ...response.data, items },
        message: 'Lấy nhiệm vụ team thành công',
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: null,
          status: 404,
          message: 'Hiện tại team chưa có nhiệm vụ hoạt động.',
        };
      }

      return {
        success: false,
        data: null,
        status: error?.response?.status,
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          'Không tải được dữ liệu nhiệm vụ.',
      };
    }
  },

  getCurrentMission: (items: RescueBatchItem[]) => {
    const inProgress = items.find((item) => item.status === 'InProgress');
    if (inProgress) return inProgress;

    return (
      items.find(
        (item) => item.status !== 'Done' && item.status !== 'Cancelled',
      ) || null
    );
  },

  getHistoryByTeam: async (teamId: string) => {
    try {
      const response = await api.get<RescueTeamHistoryResponse>(
        `/RescueRequest/teams/${teamId}/history`,
      );

      return {
        success: response.status === 200,
        data: response.data,
        message: 'Lấy lịch sử nhiệm vụ team thành công',
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: null,
          status: 404,
          message: 'Chưa có lịch sử nhiệm vụ cho team.',
        };
      }

      return {
        success: false,
        data: null,
        status: error?.response?.status,
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          'Không tải được lịch sử nhiệm vụ.',
      };
    }
  },

  getFilteredItems: (
    items: RescueBatchItem[],
    filter: 'all' | 'emergency' | 'normal' | 'in-progress' | 'pending' | 'done',
  ) => {
    switch (filter) {
      case 'emergency':
        return items.filter((item) => item.rescueRequestType === 'Emergency');
      case 'normal':
        return items.filter((item) => item.rescueRequestType === 'Normal');
      case 'in-progress':
        return items.filter((item) => item.status === 'InProgress');
      case 'pending':
        return items.filter((item) => item.status === 'Pending');
      case 'done':
        return items.filter((item) => item.status === 'Done');
      default:
        return items;
    }
  },

  toMapCoordinate,
  openExternalNavigation,
  openCallReporter,
  getMapStyleUrl,
  fetchDirectionsPolyline,
  decodePolyline,
};
