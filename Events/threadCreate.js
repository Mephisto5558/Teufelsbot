module.exports = (client, thread) => {
  thread.join().catch();
}