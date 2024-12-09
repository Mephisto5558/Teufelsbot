const exampleYear = 2003;

/** @type {import('@mephisto5558/bot-website').dashboardSetting} */
module.exports = {
  name: 'Possible Arguments for Messages',
  description: `The following args are possible for the messages:<br>
<code>{user.nickname}</code> - The user nickname - <code>Peter</code><br>
<code>{user.username}</code> - The user name - <code>Peter Lustig</code><br>
<code>{user.id}</code> - The user id - <code>123456789012345678</code><br>
<code>{user.tag}</code> - The user name with tag - <code>Peter Lustig#0001</code><br>
<code>{user.createdAt}</code> - The date the user joined discord - <code>01/01/2015</code><br>
<code>{user.joinedAt}</code> - The date the user joined the guild - <code>01/01/2015</code><br>
<code>{guild.id}</code> - The guild id - <code>123456789012345678</code><br>
<code>{guild.membercount}</code> - The guild member count - <code>23</code><br>
<code>{guild.name}</code> - The guild name - <code>Peter's Egirl paradise</code><br>
<code>{bornyear}</code> - The year the user was born - <code>${exampleYear}</code><br>
<code>{date}</code> - The current date - <code>${new Date().toLocaleDateString('en')}</code><br>
<code>{age}</code> - The new age of the user - <code>${new Date().getFullYear() - exampleYear}</code><br></p>`,
  type: 'spacer',
  position: 1
};