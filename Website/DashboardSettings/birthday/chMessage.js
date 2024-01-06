module.exports = {
  id: 'chMsg',
  name: 'Announcement Message',
  description: "The message to send on the user's birthday",
  /**@this WebServer*/
  type: function () { return this.formTypes.embedBuilder; },
  position: 3
};