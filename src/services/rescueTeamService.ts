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
    RescueActiveBatchResponse, RescueBatchItem, RescueTeamHistoryBatch, RescueTeamHistoryRequestItem, RescueTeamHistoryResponse
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
    const normalizeType = (value?: string | number | null) => {
      const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
      if (
        normalized === '1' ||
        normalized === 'emergency' ||
        normalized === 'khẩn cấp'
      ) {
        return 'emergency';
      }
      if (
        normalized === '0' ||
        normalized === 'normal' ||
        normalized === 'bình thường'
      ) {
        return 'normal';
      }
      return normalized;
    };

    const normalizeStatus = (value?: string | null) => {
      return String(value ?? '')
        .trim()
        .toLowerCase();
    };

    const inProgressStates = new Set([
      'inprogress',
      'enroute',
      'rescuing',
      'returning',
      'assigned',
    ]);

    const pendingStates = new Set(['pending', 'verified']);

    const doneStates = new Set([
      'done',
      'rescuecompleted',
      'completed',
      'closed',
      'cancelled',
    ]);

    const getStatusSet = (item: RescueBatchItem) => {
      const primaryStatus = normalizeStatus(item.status);
      const requestStatus = normalizeStatus(item.rescueRequestStatus);
      return [primaryStatus, requestStatus].filter(Boolean);
    };

    switch (filter) {
      case 'emergency':
        return items.filter(
          (item) => normalizeType(item.rescueRequestType) === 'emergency',
        );
      case 'normal':
        return items.filter(
          (item) => normalizeType(item.rescueRequestType) === 'normal',
        );
      case 'in-progress':
        return items.filter((item) =>
          getStatusSet(item).some((status) => inProgressStates.has(status)),
        );
      case 'pending':
        return items.filter((item) =>
          getStatusSet(item).some((status) => pendingStates.has(status)),
        );
      case 'done':
        return items.filter((item) =>
          getStatusSet(item).some((status) => doneStates.has(status)),
        );
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
