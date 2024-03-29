import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {v4 as uuid} from "uuid";
import {IFeatureSupport} from "./_types/IFeatureSupport";
import {IExecutionFuncs, IOptionalExecutionFuncs} from "./_types/IExecutionFunc";

/**
 * Creates a new feature support rule
 * @param feature The feature support description
 * @returns The created feature support
 */
export function createFeatureSupport<T extends IFeatureSyntax>(
    feature: Omit<IFeatureSupport<T>, "id" | keyof IExecutionFuncs<any>> &
        IOptionalExecutionFuncs<T>
): IFeatureSupport<T> {
    return {
        id: uuid(),
        recurse: (o: any, r: any) => r(o),
        ...(feature as any),
    };
}
