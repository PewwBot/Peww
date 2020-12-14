export interface SettingValueOrganizer<T> {
  organize(data: string[]): T;
}
