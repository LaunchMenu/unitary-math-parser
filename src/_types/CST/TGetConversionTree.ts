import {IASTBase} from "../AST/IASTBase";
import {IASTRecursive} from "../AST/IASTRecursive";
import {ICSTConversionNode} from "./ICSTConversionNode";
import {ICSTLeaf} from "./ICSTLeaf";

/**
 * Gets the conversion tree for a given CST child data type
 */
export type TGetConversionTree<T extends (ICSTLeaf | IASTBase)[] | undefined> =
    T extends (ICSTLeaf | IASTBase)[] ? ICSTConversionNode<T> : IASTRecursive;