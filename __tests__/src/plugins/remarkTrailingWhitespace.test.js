import { remarkTrailingWhitespace } from '../../../src/plugins';

describe('remarkTrailingWhitespace', () => {
  test('that it will remove trailing whitespace at end but wont add space when period is present', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Here is some '
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: 'text in bold '
                }
              ]
            },
            {
              type: 'text',
              value: '.'
            }
          ]
        }
      ]
    };

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will remove trailing whitespace and insert space as needed', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Here is some '
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: 'text in bold '
                }
              ]
            },
            {
              type: 'text',
              value: 'with no space after.'
            }
          ]
        }
      ]
    };

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
    expect(tree.children[0].children[2].value).toBe(' ');
    expect(tree.children[0].children[3].value).toBe('with no space after.');
  });

  test("that it will remove preceeding whitespace but won't insert space", () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Here is some '
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: ' text in bold'
                }
              ]
            },
            {
              type: 'text',
              value: ' with a space after.'
            }
          ]
        }
      ]
    };

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will remove preceeding whitespace and will insert space', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Here is some'
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: ' text in bold'
                }
              ]
            },
            {
              type: 'text',
              value: ' with a space after.'
            }
          ]
        }
      ]
    };

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    expect(tree.children[0].children[0].value).toBe('Here is some');
    expect(tree.children[0].children[1].value).toBe(' ');
    expect(tree.children[0].children[2].children[0].value).toBe('text in bold');
  });

  test('that it will handle all cases', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Here is some '
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: ' text in bold '
                },
                {
                  type: 'code'
                }
              ]
            },
            {
              type: 'text',
              value: 'with no space after.'
            },
            {
              type: 'strong',
              children: []
            }
          ]
        }
      ]
    };

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
    expect(tree.children[0].children[2].value).toBe(' ');
    expect(tree.children[0].children[3].value).toBe('with no space after.');
  });
});
