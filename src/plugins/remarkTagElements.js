/* eslint-disable no-param-reassign */
import { visit, CONTINUE } from 'unist-util-visit';
import { randomUUID } from 'node:crypto';

/**
 * Tag elements with a id so they can be replaced later.
 * @param {object} options
 * @param {Map<string,any>} options.map
 * @param {string[]} options.tagThese
 */
export default function remarkTagElements(options) {
  const { map } = options;

  return function transformer(root) {
    visit(
      root,
      (node) => {
        const { type } = node;
        return type === 'mdxJsxFlowElement';
      },
      (node) => {
        const id = randomUUID();
        map.set(id, JSON.parse(JSON.stringify(node)));

        node.type = 'html';
        node.attributes = undefined;
        node.name = undefined;
        node.value = `<mdx-placeholder-element data-tag-id="${id}"></mdx-placeholder-element>`;

        return CONTINUE;
      }
    );
    return root;
  };
}
