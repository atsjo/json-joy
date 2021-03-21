import {Identifiable} from "../json-crdt-patch/types";

/**
 * Each JsonNode represents a structural unit of a JSON document. It is like an
 * AST node, where each node has one of the following types: "object",
 * "array", "string", "number", "boolean", and "null".
 * 
 * "make" operations result into JSON nodes, for example, "make object" operation
 * create a new "object" JSON node, "make number" operation creates a number
 * JSON node, etc.
 */
export interface JsonNode extends Identifiable {
  /**
   * Returns plain JavaScript value which represents the value of this JSON node.
   */
  toJson(): unknown;
}

/**
 * Most JSON nodes (objects, arrays, strings, numbers) are composed of multiple
 * operations, those operations are usually arranged in a linked list. Each
 * entry in this linked list is a JSON *Chunk*.
 */
export interface JsonChunk extends Identifiable {
  getSpan(): number;
}
