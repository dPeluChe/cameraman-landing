// Markdown has no captions: `![alt](url "caption")` becomes a figure. Only a lone
// image in its paragraph qualifies; one inside running text keeps its title.
export const figurePlugin = {
  name: 'figure',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const [image] = node.children;
      if (node.children.length !== 1 || image.tagName !== 'img' || !image.properties.title) return;

      const { title, ...properties } = image.properties;
      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          { type: 'element', tagName: 'img', properties, children: [] },
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: title }],
          },
        ],
      });
    },
  },
};
