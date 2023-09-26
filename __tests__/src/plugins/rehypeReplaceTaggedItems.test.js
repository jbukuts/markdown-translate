import { rehypeReplaceTaggedItems } from '../../../src/plugins';

describe('rehypeReplaceTaggedItems', () => {
  test('can replace elements in tree that are tagged', () => {
    const testMap = new Map();
    testMap.set('testId', { children: [{ test: 'TEST' }] });

    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          properties: {
            dataTagId: 'testId'
          }
        }
      ]
    };
    const runner = rehypeReplaceTaggedItems({ map: testMap });
    runner(tree);
    expect(tree.children[0].children).toBe(testMap.get('testId').children);
  });
});
