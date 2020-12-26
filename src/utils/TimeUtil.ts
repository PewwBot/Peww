import * as joda from '@js-joda/core';

// tslint:disable-next-line: no-var-requires
// const { Locale } = require('@js-joda/locale_en-us');

export class TimeUtil {
  public static toMilli(time: string): number {
    const splitTime: string[] = time.toLowerCase().split(/(?<=\D)(?=\d)|(?<=\d)(?=\D)/);

    const i = Number(splitTime[0]);
    switch (splitTime[1]) {
      case 's':
        return i * 1000;
      case 'm':
        return i * 1000 * 60;
      case 'h':
        return i * 1000 * 60 * 60;
      case 'd':
        return i * 1000 * 60 * 60 * 24;
      case 'w':
        return i * 1000 * 60 * 60 * 24 * 7;
      case 'mo':
        return i * 1000 * 60 * 60 * 24 * 30;
      default:
        return -1;
    }
  }

  public static toForm(time: joda.Duration): string {
    const diffInDays = time.toDays();
    const diffInHours = time.toHours() - joda.Duration.ofDays(diffInDays).toHours();
    const diffInMinutes =
      time.toMinutes() - joda.Duration.ofHours(diffInHours).toMinutes() - joda.Duration.ofDays(diffInDays).toMinutes();
    const diffInSeconds =
      time.seconds() -
      joda.Duration.ofMinutes(diffInMinutes).seconds() -
      joda.Duration.ofHours(diffInHours).seconds() -
      joda.Duration.ofDays(diffInDays).seconds();

    let timeStr = '';
    if (diffInDays > 0) {
      timeStr += diffInDays + ' gün, ';
    }
    if (diffInHours > 0) {
      timeStr += diffInHours + ' saat, ';
    }
    if (diffInMinutes > 0) {
      timeStr += diffInMinutes + ' dakika, ';
    }
    if (diffInSeconds > 0) {
      timeStr += diffInSeconds + ' saniye';
    }
    return timeStr.toString().replace(/ $/, '').replace(/,$/, '');
  }
}
