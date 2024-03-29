import {Unit} from "../features/util/number/Unit";
import {
    decameter,
    kilometer,
    meter,
    length,
    centimeter,
    decimeter,
    hectometer,
} from "../features/util/number/units/lengths";
import {joule, kilojoule, power} from "../features/util/number/units/power";
import {
    day,
    hour,
    millisecond,
    minute,
    second,
    time,
    week,
} from "../features/util/number/units/times";
import {kilogram, weight} from "../features/util/number/units/weight";

describe("Unit", () => {
    describe("Unit.getDimensions()", () => {
        it("Should obtain the dimensions of a unit", () => {
            const kmPerHour = new Unit([meter], [hour]);
            const dimensions = kmPerHour.getDimensions();
            expect(dimensions.numerator).toEqual([length]);
            expect(dimensions.denominator).toEqual([time]);
        });
        it("Should cancel out terms in both numerator and denominator", () => {
            const someUnit = new Unit([meter, meter, minute], [hour, kilometer]);
            const dimensions = someUnit.getDimensions();
            expect(dimensions.numerator).toEqual([length]);
            expect(dimensions.denominator).toEqual([]);
        });
        it("Should retrieve the base dimensions of the unit", () => {
            const someUnit = new Unit([joule], [kilometer]);
            const dimensions = someUnit.getDimensions();
            expect(dimensions.numerator).toEqual([weight, length]);
            expect(dimensions.denominator).toEqual([time, time]);
        });
    });
    describe("Unit.hasSameDimensions()", () => {
        it("Should return true if two units have the same base dimensions", () => {
            const jouleSecondPerMeter = new Unit([joule, second], [meter]);
            const kgDmPerHour = new Unit([kilogram, decameter], [hour]);
            expect(jouleSecondPerMeter.hasSameDimensions(kgDmPerHour)).toBe(true);
        });
        it("Should return false if two units have the same base dimensions", () => {
            const joulePerSecond = new Unit([joule], [second]);
            const kilojoulePerMinute = new Unit([kilojoule], [meter]);
            expect(joulePerSecond.hasSameDimensions(kilojoulePerMinute)).toBe(false);
        });
    });
    describe("Unit.convert()", () => {
        it("Should convert to a base type", () => {
            const km = new Unit([kilometer], []);
            const m = new Unit([meter], []);
            const inMeters = m.convert(5, km);
            expect(inMeters).toBe(5e3);
        });
        it("Should convert from a base type", () => {
            const km = new Unit([kilometer], []);
            const m = new Unit([meter], []);
            const inKms = km.convert(5, m);
            expect(inKms).toBe(5e-3);
        });
        it("Should convert between any two type", () => {
            const km = new Unit([kilometer], []);
            const dm = new Unit([decameter], []);
            const inKms = km.convert(5, dm);
            expect(inKms).toBe(5e-2);
        });
        it("Should convert to complex base types", () => {
            const kmPerHour = new Unit([kilometer], [hour]);
            const mPerSecond = new Unit([meter], [second]);
            const inMpS = mPerSecond.convert(18, kmPerHour);
            expect(inMpS).toBe(5);
        });
        it("Should convert from complex base types", () => {
            const mPerSecond = new Unit([meter], [second]);
            const kmPerHour = new Unit([kilometer], [hour]);
            const inKMpH = kmPerHour.convert(5, mPerSecond);
            expect(inKMpH).toBe(18);
        });
        it("Should convert between any two complex types", () => {
            const kmPerHour = new Unit([kilometer], [hour]);
            const mPerMillisecond = new Unit([meter], [millisecond]);
            const inMpMS = mPerMillisecond.convert(18, kmPerHour);
            expect(inMpMS).toBeCloseTo(5e-3, 10);
        });
        it("Should convert properly between derived dimensions", () => {
            const joulePerSecond = new Unit([joule], [second]);
            const kilojoulePerMinute = new Unit([kilojoule], [minute]);
            const inJpM = kilojoulePerMinute.convert(24, joulePerSecond);
            expect(inJpM).toBe(1.44);

            const jouleSecondPerMeter = new Unit([joule, second], [meter]);
            const kgDmPerHour = new Unit([kilogram, decameter], [hour]);
            const inKgDmSpH = kgDmPerHour.convert(24, jouleSecondPerMeter);
            expect(inKgDmSpH).toBe(8640);
        });
        it("Should return undefined for incompatible units", () => {
            const joulePerSecond = new Unit([joule], [second]);
            const kilojoulePerMinute = new Unit([kilojoule], [meter]);
            const inJpM = kilojoulePerMinute.convert(24, joulePerSecond);
            expect(inJpM).toBe(undefined);
        });
    });
    describe("Unit.simplify()", () => {
        it("Should simplify dimensions that are both in numerator and denominator", () => {
            const meterPerKilometer = new Unit([meter], [kilometer]);
            const result = meterPerKilometer.simplify();
            expect(result.numerator).toEqual([]);
            expect(result.denominator).toEqual([]);
            expect(meterPerKilometer.hasSameDimensions(result)).toBe(true);

            const meterPerKilometerSecond = new Unit([meter], [kilometer, second]);
            const result2 = meterPerKilometerSecond.simplify();
            expect(result2.numerator).toEqual([]);
            expect(result2.denominator).toEqual([second]);
            expect(meterPerKilometerSecond.hasSameDimensions(result2)).toBe(true);
        });
        it("Should cancel out each pure unit exactly once", () => {
            const meterPerKilometer = new Unit(
                [meter, decameter, joule],
                [kilometer, joule, meter, centimeter]
            );
            const result = meterPerKilometer.simplify();
            expect(result.numerator).toEqual([]);
            expect(result.denominator).toEqual([centimeter]);
            expect(meterPerKilometer.hasSameDimensions(result)).toBe(true);
        });
        describe("Unit.simplify({expandUnitsToCancelOut: true})", () => {
            it("Should expand units if it helps canceling out", () => {
                const joulePerMeter = new Unit([joule], [meter]);
                const result = joulePerMeter.simplify({
                    expandUnitsToCancelOut: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([kilogram, meter]);
                expect(result.denominator).toEqual([second, second]);
                expect(joulePerMeter.hasSameDimensions(result)).toBe(true);
            });
            it("Should not expand units if it doesn't help canceling out", () => {
                const joulePerMeter = new Unit([joule], [second]);
                const result = joulePerMeter.simplify({
                    expandUnitsToCancelOut: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([joule]);
                expect(result.denominator).toEqual([second]);
                expect(joulePerMeter.hasSameDimensions(result)).toBe(true);
            });
            it("Should expand denominator terms too if it helps canceling out", () => {
                const meterPerJoule = new Unit([meter], [joule]);
                const result = meterPerJoule.simplify({
                    expandUnitsToCancelOut: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([second, second]);
                expect(result.denominator).toEqual([kilogram, meter]);
                expect(meterPerJoule.hasSameDimensions(result)).toBe(true);
            });
            it("Should not expand denominator units if it doesn't help canceling out either", () => {
                const secondPerJoule = new Unit([second], [joule]);
                const result = secondPerJoule.simplify({
                    expandUnitsToCancelOut: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([second]);
                expect(result.denominator).toEqual([joule]);
                expect(secondPerJoule.hasSameDimensions(result)).toBe(true);
            });
        });
        describe("Unit.simplify({expandUnits: true})", () => {
            it("Should fully expand units", () => {
                const joules = new Unit([joule], []);
                const result = joules.simplify({
                    expandUnits: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([kilogram, meter, meter]);
                expect(result.denominator).toEqual([second, second]);
                expect(joules.hasSameDimensions(result)).toBe(true);
            });
            it("Should keep units expanded even if expandUnitsToCancelOut was used", () => {
                const joules = new Unit([joule], []);
                const result = joules.simplify({
                    expandUnits: true,
                    expandUnitsToCancelOut: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([kilogram, meter, meter]);
                expect(result.denominator).toEqual([second, second]);
                expect(joules.hasSameDimensions(result)).toBe(true);
            });
            it("Should work properly with multiple units too", () => {
                const jouleJoule = new Unit([joule, joule], []);
                const result = jouleJoule.simplify({
                    expandUnits: true,
                    convertUnits: false,
                });
                expect(result.numerator).toEqual([
                    kilogram,
                    meter,
                    meter,
                    kilogram,
                    meter,
                    meter,
                ]);
                expect(result.denominator).toEqual([second, second, second, second]);
                expect(jouleJoule.hasSameDimensions(result)).toBe(true);
            });
        });
        describe("Unit.simplify({convertUnits: true})", () => {
            it("Should put all units with the same dimension to the same unit", () => {
                const meterKilometerDecameterPerSecondHour = new Unit(
                    [meter, kilometer, decameter],
                    [second, hour]
                );
                const result = meterKilometerDecameterPerSecondHour.simplify({
                    convertUnits: true,
                });
                expect(result.numerator).toEqual([meter, meter, meter]);
                expect(result.denominator).toEqual([second, second]);
                expect(
                    meterKilometerDecameterPerSecondHour.hasSameDimensions(result)
                ).toBe(true);
            });
            it("Should bundle the same dimensions together", () => {
                const meterSecondKilometerHourPerJouleKilogramJoule = new Unit(
                    [meter, second, kilometer, hour],
                    [joule, kilogram, joule]
                );
                const result = meterSecondKilometerHourPerJouleKilogramJoule.simplify({
                    convertUnits: true,
                });
                expect(result.numerator).toEqual([meter, meter, second, second]);
                expect(result.denominator).toEqual([joule, joule, kilogram]);
                expect(
                    meterSecondKilometerHourPerJouleKilogramJoule.hasSameDimensions(
                        result
                    )
                ).toBe(true);
            });
        });
    });
    describe("Unit.getDimensionMismatch", () => {
        it("Should remove all shared units", () => {
            const meterMeterKilometerDecameterPerSecondHour = new Unit(
                [meter, meter, kilometer, decameter],
                [second, hour]
            );
            const meterKilometerDecameterPerSecondHourHour = new Unit(
                [meter, kilometer, decameter],
                [second, hour, hour]
            );
            const {extra, missing} =
                meterMeterKilometerDecameterPerSecondHour.getDimensionsDifferentFrom(
                    meterKilometerDecameterPerSecondHourHour
                );
            expect(extra).toEqual({numerator: [length], denominator: []});
            expect(missing).toEqual({numerator: [], denominator: [time]});
        });
        it("Should remove all shared dimensions regardless of unit", () => {
            const meterMeterKilometerDecameterPerSecondHour = new Unit(
                [centimeter, centimeter, decimeter, hectometer],
                [week, day]
            );
            const meterKilometerDecameterPerSecondHourHour = new Unit(
                [meter, kilometer, decameter],
                [second, hour, hour]
            );
            const {extra, missing} =
                meterMeterKilometerDecameterPerSecondHour.getDimensionsDifferentFrom(
                    meterKilometerDecameterPerSecondHourHour
                );
            expect(extra).toEqual({numerator: [length], denominator: []});
            expect(missing).toEqual({numerator: [], denominator: [time]});
        });
        it("Should expand dimensions to attempt removal", () => {
            const joulePerHour = new Unit([joule], [hour]);
            const meterKilogramPerSecondSecondHour = new Unit(
                [meter, kilogram],
                [second, hour, hour, second]
            );
            const {extra, missing} = joulePerHour.getDimensionsDifferentFrom(
                meterKilogramPerSecondSecondHour
            );
            expect(extra).toEqual({numerator: [length], denominator: []});
            expect(missing).toEqual({numerator: [], denominator: [time]});
        });
        it("Should condense dimensions afterwards if not removed", () => {
            const joulePerHour = new Unit([joule, second], [hour]);
            const hourPerKilogram = new Unit([hour], [kilogram]);
            const {extra, missing} =
                joulePerHour.getDimensionsDifferentFrom(hourPerKilogram);
            expect(extra).toEqual({numerator: [power], denominator: [time]});
            expect(missing).toEqual({numerator: [], denominator: [weight]});
        });
    });
    describe("Unit.equals()", () => {
        it("Should by default check strict equivalence", () => {
            const jouleMeterPerHour = new Unit([joule, meter], [hour]);

            const jouleMeterPerHour2 = new Unit([joule, meter], [hour]);
            expect(jouleMeterPerHour.equals(jouleMeterPerHour2)).toBe(true);

            const hourPerKilogram = new Unit([hour], [kilogram]);
            expect(jouleMeterPerHour.equals(hourPerKilogram)).toBe(false);

            const meterJoulePerHour = new Unit([meter, joule], [hour]);
            expect(jouleMeterPerHour.equals(meterJoulePerHour)).toBe(false);
        });
        it("Should ignore reorders with weak equivalence", () => {
            const jouleMeterPerHour = new Unit([joule, meter], [hour]);

            const jouleMeterPerHour2 = new Unit([joule, meter], [hour]);
            expect(jouleMeterPerHour.equals(jouleMeterPerHour2, true)).toBe(true);

            const hourPerKilogram = new Unit([hour], [kilogram]);
            expect(jouleMeterPerHour.equals(hourPerKilogram, true)).toBe(false);

            const meterJoulePerHour = new Unit([meter, joule], [hour]);
            expect(jouleMeterPerHour.equals(meterJoulePerHour, true)).toBe(true);
        });
        it("Should consider equivalent units", () => {
            const jouleMeterPerHour = new Unit([joule, meter], [hour]);

            const meterCubedKilogramPerSecondSecondHour = new Unit(
                [meter, meter, meter, kilogram],
                [second, second, hour]
            );
            expect(
                jouleMeterPerHour.equals(meterCubedKilogramPerSecondSecondHour, true)
            ).toBe(true);
            expect(
                jouleMeterPerHour.equals(meterCubedKilogramPerSecondSecondHour, false)
            ).toBe(false);

            const meterKilogramPerSecondCubed = new Unit(
                [meter, meter, meter, kilogram],
                [second, second, second]
            );
            expect(jouleMeterPerHour.equals(meterKilogramPerSecondCubed, true)).toBe(
                false
            );
        });
    });
});
