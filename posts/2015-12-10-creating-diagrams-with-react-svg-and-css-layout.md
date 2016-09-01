---
title: Creating diagrams with React, SVG, and CSS-Layout
---
This article shows our process at [Rescale][re] for creating diagrams using
[React][r], [SVG][s], and Facebook's [css-layout][c] library. At [Rescale][re],
we provide a web UI for our customers to set up a license proxy server for
communication between our compute nodes and their on-premise license servers. A
diagram is a great way to show our users how these servers communicate with each
other.

Here's an example of the diagram we created with this technique. The controls
are just to show that React can rerender the diagram when state changes.

<p align="center">
  <img src="https://i.imgur.com/BbGuHsj.gif" alt="Diagram" />
</p>

SVG is a good choice for creating diagrams within React because it's just part
of the DOM. However, laying out SVG elements is not as simple as using CSS with
HTML because SVG element coordinates are usually specified absolutely, (imagine
CSS where everything is `position: absolute`). That's where Facebook's
[css-layout][c] comes in. It allows us to use CSS's [flexbox][f] model to lay
out our SVG elements.

With React, SVG, and css-layout, we are able to:
- Dynamically change the diagram due to changes in a component's `props` or
  `state`
- Iterate quickly on requirement changes
- Localize to other languages using our existing method of localizing the UI

### Wireframing

To begin creating the diagram, we wireframe it using HTML with the default
styles as written in css-layout's [README][rm]:

```css
div, span {
  box-sizing: border-box;
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
  align-content: flex-start;

  border: 0 solid black;
  margin: 0;
  padding: 0;
}
```

The wireframe of the diagram in HTML looks like this:

```html
<div style="align-items: center">
  <div style="padding: 1em; width: 12em">
    <div style="height: 1em">Rescale</div>
    <div style="height: 3em; margin-bottom: 2em; margin-top: 1em">
      Compute
    </div>
    <div style="height: 3em">
      License Proxy
    </div>
  </div>

  <div style="margin-top: 3em">
    <div style="height: 1em; margin: 1em">
      On-Premise
    </div>
    <div style="flex-direction: row; margin-bottom: 1em; padding-left: 0.5em; padding-right: 0.5em">
      <div style="height: 6em; margin-left: 0.5em; margin-right: 0.5em; width: 8em">
        License Server 1
      </div>
      <div style="height: 6em; margin-left: 0.5em; margin-right: 0.5em; width: 8em">
        License Server 2
      </div>
    </div>
  </div>
</div>
```

This produces:

<p align="center">
  <img src="https://i.imgur.com/JvRDq5B.png" alt="Wireframe" />
</p>

Borders were added to each `div` just to show their boundaries. A couple of
things to keep in mind:

- We should only be using css-layout's [supported attributes][sa]
- Positioning text in SVG will still be a somewhat manual process, especially
  vertical centering

### Creating the css-layout tree from the wireframe

In css-layout, a node is just an object with `{ style: { ... }, children: [
nodes ] }`. The root node is considered the tree. Running `computeLayout()` on
the tree will populate all of its nodes with a `layout` object that contains
`width`, `height`, `top`, `left`, `right`, and `bottom`. This is what we'll use
to position the SVG elements.

Creating the tree from the wireframe is just a simple read off of the HTML.
`id`s are given to each node so that we can access the `layout` property of each
node by `id` later.

```js
const computeLayout = require('css-layout');
const range = require('lodash/utility/range');

function em(n) {
  return n * 12;
}

const numServers = 2;

const nodeTree = {
  id: 'root',
  style: { alignItems: 'center' },
  children: [
    {
      id: 'rescaleBox',
      style: { padding: em(1), width: em(12) },
      children: [
        { id: 'rescaleLabel', style: { height: em(1) } },
        {
          id: 'computeNodes',
          style: { height: em(3), marginBottom: em(2), marginTop: em(1) },
        },
        { id: 'licenseProxy', style: { height: em(3) } },
      ],
    },
    {
      id: 'onPremiseBox',
      style: {
        marginTop: em(3),
      },
      children: [
        { id: 'onPremiseLabel', style: { height: em(1), margin: em(1) } },
        {
          id: 'onPremiseServers',
          style: {
            flexDirection: 'row',
            marginBottom: em(1),
            paddingLeft: em(0.5),
            paddingRight: em(0.5),
          },
          children: range(0, numServers).map(i => {
            return {
              id: `server${i}`,
              style: {
                height: em(6),
                marginLeft: em(0.5),
                marginRight: em(0.5),
                width: em(8),
              },
            };
          }),
        },
      ],
    },
  ],
};

computeLayout(nodeTree);
```

### Rendering with React

We have each of our nodes populated with the `layout` property. Making these
`layout` objects accessible by `id` is pretty simple:

```js
function createLayoutMap(obj, map={}) {
  if (obj.id) {
    map[obj.id] = obj.layout;
  }

  if (obj.children) {
    for (let i = 0; i < obj.children.length; i++) {
      createLayoutMap(obj.children[i], map);
    }
  }

  return map;
}

const l = createLayoutMap(nodeTree);
```

The `l` object contains all of the layout information accessible by the `id`
given to each node. With it we can now use a combination of `<g>`, `<rect>`, and
`<text>` to render the diagram in React:

```js
render() {
  // ... all the other stuff above ...
  const l = createLayoutMap(nodeTree);

  return (
    <svg width={l.root.width} height={l.root.height} xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(${l.rescaleBox.left}, ${l.rescaleBox.top})`}>
        <rect
          width={l.rescaleBox.width}
          height={l.rescaleBox.height}
          stroke="#70a5c3"
          strokeWidth="3"
          fill="#f9f9f9"
        />
        <text x={l.rescaleLabel.left} y={l.rescaleLabel.top} dy="1em" fontSize={em(1)}>
          {gettext('Rescale')}
        </text>

        <g transform={`translate(${l.computeNodes.left}, ${l.computeNodes.top})`}>
          <rect
            width={l.computeNodes.width}
            height={l.computeNodes.height}
            fill="#ffffdd"
            stroke="#333333"
            strokeWidth="2"
          />
          <text
            x={l.computeNodes.width / 2}
            y={l.computeNodes.height / 2}
            textAnchor="middle"
            dy="0.3em"
            fontSize={em(1)}
          >
            {gettext('Compute Nodes')}
          </text>
        </g>

        <g transform={`translate(${l.licenseProxy.left}, ${l.licenseProxy.top})`}>
          <rect
            width={l.licenseProxy.width}
            height={l.licenseProxy.height}
            fill="#ffffdd"
            stroke="#333333"
            strokeWidth="2"
          />
          <text
            x={l.licenseProxy.width / 2}
            y={l.licenseProxy.height / 2}
            textAnchor="middle"
            dy="-.3em"
            fontSize={em(1)}
          >
            {gettext('License Proxy')}
          </text>
          <text
            x={l.licenseProxy.width / 2}
            y={l.licenseProxy.height / 2}
            textAnchor="middle"
            dy="1em"
            fontSize={em(1)}
          >
            {licenseProxyIp}
          </text>
        </g>

        // ... and so on, the rest is left as an exercise for the reader
      </g>
    </svg>
  );
}
```

As you can see, we're using the `layout` properties computed by css-layout to
position the elements or set their widths and heights. Things to note:

- The `top`, `right`, `bottom`, and `left` properties in the `layout` objects
  are relative to its parent node. In SVG, we use ``<g
  transform={`translate(${left}, ${top})`}>`` so that each child of the `<g>`
  element is positioned relative to that transformation.
- Positioning text is somewhat manual as mentioned above. The `textAnchor`
  property can handle horizontal centering, but we need to use the `dy` property
  with some magic numbers to handle vertical centering.

This technique was inspired by this [blog post][b] showing how to lay out D3
charts using css-layout.

This article was crossposted on [Rescale's blog][rs].

[b]: http://blog.scottlogic.com/2015/02/02/svg-layout-flexbox.html
[c]: https://github.com/facebook/css-layout
[f]: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
[r]: https://facebook.github.io/react/
[re]: http://www.rescale.com/
[rm]: https://github.com/facebook/css-layout#default-values
[rs]: https://blog.rescale.com/creating-diagrams-with-react-svg-and-css-layout/
[s]: https://developer.mozilla.org/en-US/docs/Web/SVG
[sa]: https://github.com/facebook/css-layout#supported-attributes
