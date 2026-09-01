// Access gate for the TungMeow Web App. Checked by Router.gs before dispatch.

/**
 * Compares the request token against the API_TOKEN script property.
 * Basic access gate for a single-user app, not real authentication (no OAuth/sessions).
 */
function isValidToken(token) {
  return token === PropertiesService.getScriptProperties().getProperty("API_TOKEN");
}
