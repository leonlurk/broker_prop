import { translations } from '../translations';

/**
 * Returns a translator function configured for the given language.
 * @param {string} language - The current language code (e.g., 'es', 'en').
 * @returns {function(string): string} A function that takes a translation key and returns the translated string.
 */
export const getTranslator = (language) => {
  /**
   * Translates a given key into the configured language.
   * @param {string} key - The key of the string to translate.
   * @param {object} [options] - Optional parameters for interpolation.
   * @returns {string} The translated string, or the key itself if no translation is found.
   */
  return (key, options) => {
    let translation = translations[key]?.[language] || translations[key]?.['en'] || key;

    // Basic interpolation: replace {{placeholder}} with values from options
    if (options && typeof translation === 'string') {
      Object.keys(options).forEach(placeholder => {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        translation = translation.replace(regex, options[placeholder]);
      });
    }
    
    return translation;
  };
}; 