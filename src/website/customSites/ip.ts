import { CustomPage } from '#types/locals';

export default {
  title: 'Your IP',

  run: (res, req) => res.send(req.header('x-forwarded-for') ?? req.socket.remoteAddress ?? 'unknown')
} satisfies CustomPage;