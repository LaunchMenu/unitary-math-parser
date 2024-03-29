import {IBaseFeature} from "./_types/IBaseFeature";
import {IFeatureSyntax} from "./_types/IFeatureSyntax";
import {IExecutionFuncs, IOptionalExecutionFuncs} from "./_types/IExecutionFunc";

/**
 * Creates a new feature
 * @param feature The feature description
 * @returns The created feature
 */
export function createBaseFeature<T extends IFeatureSyntax>(
    feature: Omit<IBaseFeature<T>, keyof IExecutionFuncs<any>> &
        IOptionalExecutionFuncs<T>
): IBaseFeature<T> {
    return feature as any;
}
