module.exports = thread => {
  if (thread.joinable) thread.join();
}