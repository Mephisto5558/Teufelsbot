module.exports = function threadCreate() {
  if (this.joinable) this.join();
}