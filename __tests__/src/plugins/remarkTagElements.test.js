import { remarkTagElements } from '../../../src/plugins';

describe('remarkTagElements', () => {
  test('that no elements are tagged', () => {
    const testMap = new Map();
    const tree = { type: 'root', children: [] };
    const runner = remarkTagElements({ map: testMap });
    runner(tree);
    expect([...testMap.values()].length).toStrictEqual(0);
  });

  test('that MDX elements are tagged', () => {
    const testMap = new Map();
    const tree = {
      type: 'root',
      children: [
        {
          type: 'mdxJsxFlowElement'
        }
      ]
    };

    const runner = remarkTagElements({ map: testMap });
    runner(tree);
    expect([...testMap.values()].length).toStrictEqual(1);
  });
});
