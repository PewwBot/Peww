export class StringUtil {

  public static capitalize(text: string, lang: string): string {
    if (typeof text !== 'string') return '';
    return text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);
  }

}