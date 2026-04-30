import type { AssignedVehicle } from '../types/vehicle';

type VehicleLabelSource = {
  vehicleName?: string | null;
  vehicleLicensePlate?: string | null;
  vehicles?: AssignedVehicle[] | null;
};

export function formatVehicleLabel(
  vehicle?: {
    vehicleName?: string | null;
    vehicleLicensePlate?: string | null;
  } | null,
) {
  const vehicleName = String(vehicle?.vehicleName ?? '').trim();
  const vehicleLicensePlate = String(vehicle?.vehicleLicensePlate ?? '').trim();

  if (vehicleName && vehicleLicensePlate) {
    return `${vehicleName} - ${vehicleLicensePlate}`;
  }

  if (vehicleName) {
    return vehicleName;
  }

  if (vehicleLicensePlate) {
    return vehicleLicensePlate;
  }

  return 'Chưa điều phối';
}

export function getPrimaryVehicle(vehicles: AssignedVehicle[] = []) {
  return vehicles.find((vehicle) => vehicle.isPrimary) ?? vehicles[0] ?? null;
}

export function getPrimaryVehicleLabel(source: VehicleLabelSource) {
  const primaryVehicle = getPrimaryVehicle(source.vehicles ?? []);

  if (primaryVehicle) {
    return formatVehicleLabel(primaryVehicle);
  }

  return formatVehicleLabel(source);
}

export function getVehicleLabels(vehicles: AssignedVehicle[] = []) {
  return vehicles.map((vehicle) => ({
    label: formatVehicleLabel(vehicle),
    isPrimary: vehicle.isPrimary,
  }));
}
