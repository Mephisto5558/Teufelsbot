import type { CustomPage } from '#types/locals';

const

  // using ?data=e30= because e30= is {} in base64 so we don't have default values
  url = 'https://glitchii.github.io/embedbuilder?nouser&hidemenu&data=e30=',
  style = 'width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0"';

export default {
  title: 'Embedbuilder',

  run(res, req): unknown {
    const query = req.originalUrl.split(/(?=\?)/).pop(); // Keep the "?"

    return res.send(
      `<body style="margin: 0"><iframe src="${url}${query?.startsWith('?') ? '&' + query.slice(1) : ''}" `
      + style + ' allow="clipboard-write *">Loading…</iframe></body>'
    );
  }
} satisfies CustomPage;