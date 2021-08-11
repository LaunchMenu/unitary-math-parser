import {IValueFormat} from "../formats/_types/IValueFormat";
import {date} from "./date";
import {IDateFormatKey, IContextualDateParser, IDateParts} from "./_types/IDateFormatKey";
import {dateDayFormatters} from "./formatters/dateDayFormatters";
import {dateMonthFormatters} from "./formatters/dateMonthFormatters";
import {dateWeekFormatters} from "./formatters/dateWeekFormatters";
import {dateYearFormatters} from "./formatters/dateYearFormatters";

/**
 * Creates a new date format using PHP's standard: https://www.php.net/manual/en/datetime.format.php
 * @param format The string representing the format
 * @returns The create date format
 */
export function createDateFormat(format: string): IValueFormat<Date> {
    const formatters =
        format.match(/(\\.|.)/g)?.map(symbol => {
            const char = symbol.slice(-1); // Gets the last character (character may be prefixed with \)
            if (symbol.length == 1 && allFormatters[char]) return allFormatters[char];
            return createLiteralFormatter(char);
        }) ?? [];

    return {
        dataType: date,
        name: format,
        identifier: Symbol(format),
        decode: (date: string) => {
            const parsers: {index: number; parser: IContextualDateParser}[] = [];
            let dateParts: IDateParts = {};
            let remainingDate = date;
            let index = 0;

            // Go through all formatters/parsers
            for (let formatter of formatters) {
                const parsed = formatter.decode(remainingDate);
                if (typeof parsed == "string") return {index, error: parsed};

                index += parsed.consumedLength;
                remainingDate = remainingDate.substring(parsed.consumedLength);

                if (parsed.parsed instanceof Function)
                    parsers.push({parser: parsed.parsed, index});
                else dateParts = {...dateParts, ...parsed.parsed};
            }

            // Execute the contextual parsers
            outer: while (parsers.length > 0) {
                let errorMessage: {index: number; error: string} | undefined;
                for (let parserIndex = 0; parserIndex < parsers.length; parserIndex++) {
                    const {index, parser} = parsers[parserIndex];
                    const parsed = parser(dateParts);

                    if (typeof parsed == "string") {
                        if (!errorMessage) errorMessage = {index, error: parsed};
                    } else {
                        dateParts = {...dateParts, ...parsed};
                        parsers.splice(parserIndex, 1);
                        continue outer;
                    }
                }

                if (errorMessage) return errorMessage;
            }

            // Compute the date
            if (!dateParts.year) return {index: 0, error: "No year was specified"};
            return {
                value: new Date(
                    `${dateParts.year}-${(dateParts.month ?? 0) + 1}-${
                        dateParts.day ?? 1
                    } ${dateParts.hour ?? 0}:${dateParts.minute ?? 0}:${
                        dateParts.second ?? 0
                    }`
                ),
            };
        },
        encode: (date: Date) =>
            formatters.map(formatter => formatter.encode(date)).join(""),
    };
}

// TODO: add some kind of date language parameter

/**
 * Creates a literal symbol formatter
 * @param symbol The symbol to get the formatter for
 * @returns The formatter
 */
export function createLiteralFormatter(symbol: string): IDateFormatKey {
    return {
        encode: date => symbol,
        decode: dateStr =>
            dateStr[0] == symbol
                ? {parsed: {}, consumedLength: 1}
                : `Expected the symbol "${symbol}"`,
    };
}

export const allFormatters: Record<string, IDateFormatKey> = {
    ...dateDayFormatters,
    ...dateMonthFormatters,
    ...dateWeekFormatters,
    ...dateYearFormatters,
};
