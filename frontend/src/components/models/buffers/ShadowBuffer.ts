// frontend/src/components/models/buffers/ShadowBuffer.ts

import { Block } from "@blocknote/core";


type Serializer = (blocks: Block[]) => string

/**
 *  A middleman between the editor and the file system.
 *  This is the logic that makes saving and loading files quick.
 *  For instance, if we have a file that contains thousands of blocks
 *  we don't want to serialize and deserialize the entire doc tree 
 *  for any small change. Instead, we'd like to only serialize the 
 *  specific block that has changed.
 * 
 *  The ShadowBuffer is a buffer that contains the raw bytes of the
 *  entire file. Any time we make a small change to a block, we're able
 *  to find the [start, end] range of the bytes that make up that block
 *  and only serialize that range.
 * 
 *  Note: This is important because we want all of the files to be stored
 *  in markdown instead of the custom block format. In other words, the editor
 *  relies on the block format which is converted on load up but any persistence
 *  requires it to be converted back to markdown.
 */
class ShadowBuffer {
    constructor(initBytes: Uint8Array, serializer: Serializer, initBlocks?: Block[]) {}

    
}