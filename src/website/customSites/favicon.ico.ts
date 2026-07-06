import { CustomPage } from '#types/locals';

export default {
  run(res) { return res.redirect(this.client.user.displayAvatarURL()); }
} satisfies CustomPage;