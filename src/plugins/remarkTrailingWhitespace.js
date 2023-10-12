/* eslint-disable no-param-reassign */

import { visit, CONTINUE, SKIP } from 'unist-util-visit';

const END_WHITESPACE = /^.*\s$/;
const START_WHITESPACE = /^\s.*$/;

/**
 * Plugin to remove trailing whitespace within bold or italicized text in Markdown
 *
 * Referenced from:
 * - {@link https://github.com/orgs/syntax-tree/discussions/60#discussioncomment-2111096|Fix}
 * - {@link https://github.com/remarkjs/remark/issues/908|Issue}
 */
export default function remarkTrailingWhitespace() {
  return function transformer(tree) {
    visit(tree, ['strong', 'emphasis'], (node, index, parent) => {
      // Remove empty nodes
      if (!node.children.length) {
        parent.children.splice(index, 1);
        return SKIP;
      }

      // iterate over children of tag
      node.children.forEach((c) => {
        const { type, value } = c;
        const origValue = `${value}`;

        // if a child has text
        if (type === 'text') {
          // and ends with a whitespace
          if (END_WHITESPACE.test(origValue)) {
            c.value = value.trim();

            // and the next doesn't start with a period
            const next = parent.children[index + 1];
            if (next && !next.value.startsWith('.')) {
              parent.children.splice(index + 1, 0, { type: 'text', value: ' ' });
            }
          }

          // and ends starts with a whitespace
          if (START_WHITESPACE.test(origValue)) {
            c.value = value.trim();

            // and the previous doesn't end with a space
            const prev = parent.children[index - 1];
            if (prev && !prev.value.endsWith(' ')) {
              parent.children.splice(index, 0, { type: 'text', value: ' ' });
            }
          }
        }
      });

      return CONTINUE;
    });
  };
}
