import translations from './translations.js';

export default class Resources {

    // Метод для получения фразы по ключу и языку
    static getPhrase(key) {
      if (this.translations[key] && this.translations[key][this.language]) {
        return this.translations[key][this.language];
      }
      // Возвращаем сообщение об ошибке, если ключ или язык не найдены
      console.error(`Phrase not found for key: ${key}, language: ${this.language}`);
      return "#NULL";
    }

    static init(locale) {
      this.translations = translations;
      
      if(locale === null || locale === '' || !this.#hasKey(translations, locale.toUpperCase())) {
        this.language = 'UK';
      }
      else {
        this.language = locale.toUpperCase();
      }
    }

    static #hasKey = (obj, key) => 
      Object.keys(obj).includes(key) ||
      Object.values(obj)
        .filter(it => typeof it === "object" && it !== null)
        .some(it => this.#hasKey(it, key));
}