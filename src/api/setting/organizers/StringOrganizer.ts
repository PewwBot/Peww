import { SettingValueOrganizer } from './../SettingValueOrganizer';
export class StringOrganizer implements SettingValueOrganizer<string> {

  organize(data: string[]): string {
    return data.join(' ');
  }

}