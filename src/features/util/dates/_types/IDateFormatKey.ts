import {IDateLanguageTexts} from "./IDateLanguageTexts";

/** A part of a date format */
export type IDateFormatKey = {
    /**
     * Decodes part of the date
     * @param date The remaining date string
     * @param texts The language texts that can be used
     * @returns The part that remains after applying this key, and the data that was extracted from it, or an error message if parsing failed
     */
    decode(
        date: string,
        texts: IDateLanguageTexts
    ):
        | {
              consumedLength: number;
              parsed: IDateParts | IContextualDateParser;
          }
        | string;

    /**
     * Encodes part of the date to a string
     * @param date THe date to encode data from
     * @param texts The language texts that can be used
     * @returns The encoded string part
     */
    encode(date: Date, texts: IDateLanguageTexts): string;
};

export type IDateParts = {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
};

export type IContextualDateParser = {
    /**
     * Computes the new date parts from the given date parts
     * @param parts THe current date parts
     * @returns Either an error message or the new date parts
     */
    (parts: IDateParts): string | IDateParts;
};
