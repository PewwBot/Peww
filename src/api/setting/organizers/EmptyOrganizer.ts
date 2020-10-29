import { SettingValueOrganizer } from './../SettingValueOrganizer';
export class EmptyOrganizer implements SettingValueOrganizer<string[]> {

  organize(data: string[]): string[] {
    return data;
  }

}