module.exports = thread => {
  thread.join().catch(err) {};
}