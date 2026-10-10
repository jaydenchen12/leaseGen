import type { CityKey } from '../types';
import type { City } from './types';
import { philadelphia } from './philadelphia';
import { seattle } from './seattle';

export const cities: Record<CityKey, City> = { philadelphia, seattle };
