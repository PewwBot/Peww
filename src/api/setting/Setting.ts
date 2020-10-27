import { SettingChangeStatus } from './SettingChangeStatus';

export interface Setting<T, V, M> {
  name: string;

  get(t: T): Promise<V | undefined>;

  change(t: T, v: V, mode?: M): Promise<SettingChangeStatus<V>>;
}
