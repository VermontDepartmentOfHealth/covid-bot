# QnABot ReadMe




### Project Setup

Add a separate `appsettings.<environment>.json` file for each environment in `Properties/launchSettings.json` per [these instructions](https://stackoverflow.com/a/60961168/1366033).  

* `appsettings.Development.json`
* `appsettings.Production.json`

You can get them from someone who's worked on the project or grab the keys from Azure if you have access

### Contributing

#### SOV Org Members

1. Create a local branch 
2. Push changes to our repo
3. Open pull request

#### General Public

1. Fork the repo
2. Push changes to any branch
3. Create pull request into upstream master branch
4. When creating PR, check "Allow maintainers to edit my branch"


### Deployment

Deploys should only be done after a PR is merged into master

Grab the publish profile from the App Service used by the Bot