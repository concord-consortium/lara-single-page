# [LARA] Activity Player

This is a single page React and Typescript application intended to provide a platform for presenting "Lightweight" activities.

## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.
2. When coding, use 2 spaces for indentation.
3. SVG icons are imported directly into the project in src/assets/. SVGR is used to convert SVGs to React components which can be directly imported into other React components (attributes such as fill can be styled using CSS classes).

## Deployment

*TODO* Set up Travis Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to http://starter-projects.concord.org.

Other branches are deployed to http://starter-projects.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/starter-projects/branches).

To deploy a production release:

1. Increment version number in package.json
2. Create new entry in CHANGELOG.md
3. Run `git log --pretty=oneline --reverse <last release tag>...HEAD | grep '#' | grep -v Merge` and add contents (after edits if needed to CHANGELOG.md)
4. Run `npm run build`
5. Copy asset size markdown table from previous release and change sizes to match new sizes in `dist`
6. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
7. Checkout master and pull
8. Checkout production
9. Run `git merge master --no-ff`
10. Push production to GitHub
11. Use https://github.com/concord-consortium/starter-projects/releases to create a new release tag

### Testing

Run `npm test` to run jest tests. Run `npm run test:full` to run jest and Cypress tests.

##### Cypress Run Options

Inside of your `package.json` file:
1. `--browser browser-name`: define browser for running tests
2. `--group group-name`: assign a group name for tests running
3. `--spec`: define the spec files to run
4. `--headed`: show cypress test runner GUI while running test (will exit by default when done)
5. `--no-exit`: keep cypress test runner GUI open when done running
6. `--record`: decide whether or not tests will have video recordings
7. `--key`: specify your secret record key
8. `--reporter`: specify a mocha reporter

##### Cypress Run Examples

1. `cypress run --browser chrome` will run cypress in a chrome browser
2. `cypress run --headed --no-exit` will open cypress test runner when tests begin to run, and it will remain open when tests are finished running.
3. `cypress run --spec 'cypress/integration/examples/smoke-test.js'` will point to a smoke-test file rather than running all of the test files for a project.

## Url Parameters
### Note: these are subject to change

* activity={id}:     load sample-activity {id} or, if baseUrl is defined, load authored activity from `{baseUrl}/api/v1/activities/{activity}.json`
* page={n}:          load page n, where 0 is the activity introduction and 1 is the first page
* baseUrl={url}:     full url to authoring site, such as `https%3A%2F%2Fauthoring.concord.org` or `http%3A%2F%2Fapp.lara.docker%2F`

## License

Activity Player is Copyright 2020 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
