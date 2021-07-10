import {ICST} from "./ICST";
import {ICSTNode} from "./ICSTNode";
import {IValidateCST, IValidateCSTNode} from "./IValidateCST";

export type ICorrectionSuggestionConfig<T extends ICSTNode> =
    | ICorrectionSuggestionNodeConfig<T>
    | ICorrectionSuggestionTreeConfig<T>;

export type ICorrectionSuggestionNodeConfig<T extends ICSTNode> = {
    /**
     * Retrieves alternative nodes for the given node
     * @param node The node to get alternatives for
     * @param validate Optional validation function for trees to return
     * @returns The generator of different alternative nodes
     */
    getNodes(node: T, validate?: IValidateCSTNode<T>): Generator<T>;
} & ICorrectionSuggestionConfigBase<T>;

export type ICorrectionSuggestionTreeConfig<T extends ICSTNode> = {
    /**
     * Retrieves alternative trees for the given tree
     * @param tree The tree to get alternatives for
     * @param validate Optional validation function for trees to return
     * @returns The generator of different trees
     */
    getTrees(tree: ICSTNode, validate?: IValidateCST<T>): Generator<ICSTNode>;
} & ICorrectionSuggestionConfigBase<T>;

export type ICorrectionSuggestionConfigBase<T extends ICSTNode> = {
    /** The default function to use to validate the newly obtained CST */
    defaultValidation?: IValidateCST<T>;
};
