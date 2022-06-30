module.exports = _ => ({
  name: 'Possible Arguments for Messages',
  description:
    `The following args are possible for the messages:<br>
<code>&lt;user.nickname&gt;</code> - The user nickname - <code>Peter</code><br>
<code>&lt;user.username&gt;</code> - The user name - <code>Peter Lustig</code><br>
<code>&lt;user.id&gt;</code> - The user id - <code>123456789012345678</code><br>
<code>&lt;user.tag&gt;</code> - The user name with tag - <code>Peter Lustig#0001</code><br>
<code>&lt;user.joinedAt&gt;</code> - The date the user joined discord - <code>01/01/2015</code><br>
<code>&lt;guild.id&gt;</code> - The guild id - <code>123456789012345678</code><br>
<code>&lt;guild.membercount&gt;</code> - The guild member count - <code>23</code><br>
<code>&lt;guild.name&gt;</code> - The guild name - <code>Peter's Egirl paradise</code><br>
<code>&lt;bornyear&gt;</code> - The year the user was born - <code>2003</code><br>
<code>&lt;date&gt;</code> - The current date - <code>${new Date().toLocaleDateString('en')}</code><br>
<code>&lt;age&gt;</code> - The new age of the user - <code>${new Date().getFullYear() - 2003}</code><br></p>`,

  type: 'spacer',
  position: 1
})