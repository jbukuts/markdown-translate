/* eslint-disable no-param-reassign */
import { visit, CONTINUE } from 'unist-util-visit';

/**
 * Replace items with tagged ID with node from a passed in map.
 * @param {object} options
 * @param {Map<string, any>} options.map
 */
export default function rehypeReplaceTaggedItems(options) {
  const { map } = options;

  return function transformer(root) {
    visit(
      root,
      (node) => {
        const { type, properties = {} } = node;
        return type === 'element' && properties.dataTagId && map.has(properties.dataTagId);
      },
      (node) => {
        const { dataTagId } = node.properties;
        const newNode = map.get(dataTagId);
        node.children = newNode.children;
        return CONTINUE;
      }
    );
    return root;
  };
}
