/* eslint-disable no-param-reassign */
import { visit, CONTINUE } from 'unist-util-visit';
import { randomUUID } from 'node:crypto';

/**
 * Tag elements with a id so they can be replaced later.
 * @param {object} options
 * @param {Map<string,any>} options.map
 * @param {string[]} options.tagThese
 */
export default function rehypeTagElements(options) {
  const { map } = options;

  return function transformer(root) {
    visit(
      root,
      (node) => {
        const { type, tagName } = node;
        return type === 'element' && tagName === 'code';
      },
      (node) => {
        const id = randomUUID();
        node.properties = {
          ...node.properties,
          'data-tag-id': id
        };
        map.set(id, node);
        return CONTINUE;
      }
    );
    return root;
  };
}
