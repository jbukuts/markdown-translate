import { rehypeTagElements } from '../../../src/plugins';

describe('rehypeTagElements', () => {
  test('that no elements are tagged', () => {
    const testMap = new Map();
    const tree = { type: 'root', children: [] };
    const runner = rehypeTagElements({ map: testMap });
    runner(tree);
    expect([...testMap.values()].length).toStrictEqual(0);
  });

  test('that code elements are tagged', () => {
    const testMap = new Map();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'code'
        }
      ]
    };

    const runner = rehypeTagElements({ map: testMap });
    runner(tree);
    expect([...testMap.values()].length).toStrictEqual(1);
  });
});
