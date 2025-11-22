import { VehicleStatus } from 'src/modules/vehicles/vehicles.enums';

export type APIResponse = {
  message?: string;
  data?: object;
  timestamp?: string;
  accessToken?: string;
  refreshToken?: string;
  size?: number;
};

export type QueryString = {
  sort?: string;
  limit?: string;
  page?: string;
  fields?: string;
  status?: VehicleStatus;
} & Record<string, any>;
