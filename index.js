/**
 * External Modules
 */
const express = require("express");
const path = require("path");
const WorkOS = require('@workos-inc/node').default;
require('dotenv').config()
process.on('unhandledRejection', (reason, p) => { throw reason });
const bodyParser = require('body-parser');
var parser = require('tld-extract');

/**
 * App Variables
 */
const app = express();
const port = "8000";
// Initiate WorkOS with API Key.
const workos = new WorkOS(process.env.WORKOS_API_KEY);

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Route Definitions
 */
 app.get("/", async (req, res) => {
  res.render("index", {
      title: "Home",
  });
});

app.post('/provision-enterprise', async (req, res) => {
  const organizationName =  req.body.email.split('@').shift()
  const domain = req.body.email.split('@').pop()
  const organizationDomains = [domain];
  // Make call to listOrganizations and filter using the domain passed in by user.
  const organizations = await workos.organizations.listOrganizations({
    domains: organizationDomains,
  });
  // If no organizations exist with that domain, create one.
  if (organizations.data.length === 0) {
    global.organization = await workos.organizations.createOrganization({
      name: organizationName,
      domains: organizationDomains,
    });
    res.redirect('/admin-portal');
  }
  // If an organization does exist with the domain, use that organization for the connection.
  else {
    global.organization = organizations.data[0];
    res.redirect('/admin-portal');
  }
});

app.get('/admin-portal', async (_req, res) => {
  const organizationID =  organization.id;

  // Generate an SSO Adnim Portal Link using the Organization ID from above.
  const { link } = await workos.portal.generateLink({
    organization: organization.id,
    intent: 'sso',
  });

  res.redirect(link);
});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
