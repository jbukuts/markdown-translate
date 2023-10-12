/* eslint-disable no-param-reassign */

import { visit, CONTINUE, SKIP } from 'unist-util-visit';

const END_WHITESPACE = /^.*\s$/;
const START_WHITESPACE = /^\s.*$/;

/**
 * remark plugin to remove trailing whitespace within bold or italicized text in Markdown
 * Works by finding emphasized text nodes with trailing spaces,
 * trimming them, and then modifying adjacent nodes as needed
 *
 * Referenced from:
 * - {@link https://github.com/orgs/syntax-tree/discussions/60#discussioncomment-2111096|Fix}
 * - {@link https://github.com/remarkjs/remark/issues/908|Issue}
 */
export default function remarkTrailingWhitespace() {
  return function transformer(tree) {
    visit(tree, ['strong', 'emphasis'], (node, index, parent) => {
      // cull empty nodes
      if (!node.children.length) {
        parent.children.splice(index, 1);
        return SKIP;
      }

      // find children that are text nodes
      visit(node, ['text'], (c) => {
        const { value } = c;
        const origValue = `${value}`;

        // that start with a whitspace
        if (END_WHITESPACE.test(origValue)) {
          c.value = value.trim();

          // and the next doesn't start with a period
          const next = parent.children[index + 1];
          if (next && !next.value.startsWith('.')) {
            next.value = ` ${next.value}`;
          }
        }

        // that end starts with a whitespace
        if (START_WHITESPACE.test(origValue)) {
          c.value = value.trim();

          // and the previous doesn't end with a space
          const prev = parent.children[index - 1];
          if (prev && !prev.value.endsWith(' ')) {
            prev.value = `${prev.value} `;
          }
        }
      });

      return CONTINUE;
    });

    return tree;
  };
}
