const triggerError = async (req, res) => {
  // Simulate a server crash
  throw new Error("This is a simulated server error for testing purposes.")
}

module.exports = {
  triggerError,
}
