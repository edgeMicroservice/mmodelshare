function SecurityHandler(req, definition, apikey, next) {
  const { API_KEY } = req.context.env;

  if (apikey !== API_KEY) {
    next(new Error('incorrect API key'));
    return;
  }

  next();
}

module.exports = SecurityHandler;
