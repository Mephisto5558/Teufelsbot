module.exports = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}