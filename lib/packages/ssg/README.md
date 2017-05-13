# tiny-ssg

## api

### `new SSG({ dest = '${pwd}/public' } = {})`

Creates a new `SSG` instance. Can specify the destination of the generated html
by passing it `{ dest: pathToDest }`. This defaults to `public` dir of the
current working directory.

### `require('ssg/instance')`

Returns a new `SSG` instance with defaults args.

### `ssg.manifest(() => Promise<Page[]> | Page[]): void`

This is how you specify the pages that should be built. `Page` has the type:

```js
type Page = {
  url: string,
  view: () => Promise<string> | string,
  meta?: any,
}
```

### `ssg.build(): Promise<Page[]>`
