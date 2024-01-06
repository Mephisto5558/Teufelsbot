module.exports = {
  id: 'autopublish',
  name: 'Auto Publish',
  description: 'Automatically publish/crosspost every message a user writes in an announcement channel',
  /**@this WebServer*/
  type: function () { return this.formTypes.switch(); },
  position: 4
};