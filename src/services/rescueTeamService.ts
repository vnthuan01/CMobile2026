import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import api from './api';

export interface RescueBatchItem {
  rescueBatchItemId: string;
  rescueRequestId: string;
  disasterType: string;
  rescueRequestType: 'Normal' | 'Emergency' | string;
  rescueRequestStatus: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  reporterFullName: string;
  reporterPhone: string;
  sequenceOrder: number;
  isAutoAssigned: boolean;
  distanceKm: number | null;
  estimatedMinutes: number | null;
  status: 'Pending' | 'InProgress' | 'Done' | 'Cancelled' | string;
  createdAt: string;
}

export interface RescueActiveBatchResponse {
  rescueBatchId: string;
  teamId: string;
  isActive: boolean;
  status: string;
  routePolyline: string | null;
  totalDistanceKm: number | null;
  estimatedMinutes: number | null;
  createdAt: string;
  closedAt: string | null;
  items: RescueBatchItem[];
}

export interface RescueTeamHistoryRequestItem {
  requestId: string;
  address: string;
  disasterType: string;
  rescueRequestStatus: string;
  reporterFullName: string;
  reporterPhone: string;
  createdAt: string;
  updatedAt: string;
  sequenceOrder: number;
  batchItemStatus: string;
}

export interface RescueTeamHistoryBatch {
  rescueBatchId: string;
  createdAt: string;
  closedAt: string | null;
  totalRequests: number;
  completedRequests: number;
  requests: RescueTeamHistoryRequestItem[];
}

export interface RescueTeamHistoryResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: RescueTeamHistoryBatch[];
}

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';

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

  toMapCoordinate: (item: RescueBatchItem): [number, number] | null => {
    if (item.longitude == null || item.latitude == null) return null;
    return [item.longitude, item.latitude];
  },

  openExternalNavigation: async (item: RescueBatchItem) => {
    if (item.latitude == null || item.longitude == null) return false;

    const lat = item.latitude;
    const lng = item.longitude;

    const googleNative = `google.navigation:q=${lat},${lng}`;
    const googleWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMaps = `http://maps.apple.com/?daddr=${lat},${lng}`;

    try {
      if (
        Platform.OS === 'android' &&
        (await Linking.canOpenURL(googleNative))
      ) {
        await Linking.openURL(googleNative);
        return true;
      }

      if (Platform.OS === 'ios' && (await Linking.canOpenURL(appleMaps))) {
        await Linking.openURL(appleMaps);
        return true;
      }

      await Linking.openURL(googleWeb);
      return true;
    } catch {
      return false;
    }
  },

  openCallReporter: async (phone?: string | null) => {
    if (!phone) return false;
    try {
      await Linking.openURL(`tel:${phone}`);
      return true;
    } catch {
      return false;
    }
  },

  getGoongMapStyleUrl: () => {
    const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return null;
    return 'mapbox://styles/mapbox/streets-v12';
  },

  fetchDirectionsPolyline: async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => {
    if (!GOONG_API_KEY) {
      return { success: false, polyline: null as string | null };
    }

    try {
      const url = `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const polyline = data?.routes?.[0]?.overview_polyline?.points ?? null;

      return {
        success: !!polyline,
        polyline,
      };
    } catch {
      return {
        success: false,
        polyline: null as string | null,
      };
    }
  },

  decodePolyline: (encoded: string): [number, number][] => {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates: [number, number][] = [];

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  },
};
