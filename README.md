# Building your first UI5 tooling extension

### Middleware

The UI5 Server module provides server capabilities for local development of UI5 projects.

### Tasks

The UI5 Builder module takes care of building your project. Based on a project's type, the UI5 Builder defines a series of build steps to execute; these are also called **tasks**.

### Custom Middleware and Tasks

Do more with middlewares and tasks by adding custom middlewares and tasks of your own to UI5 projects.

## Development environment setup

Development can be done in both VS Code and SAP BAS as per your choice of tool. Addition to that, follow below set of instructions to get the development setup running.

### VS Code

1. Download and install VS Code if not already installed - https://code.visualstudio.com/download
2. Download and install NodeJS if not already installed - https://nodejs.org/en/download/prebuilt-installer/current

### SAP BAS

1. Start SAP BAS - https://developers.sap.com/tutorials/appstudio-lcap-onboarding-trial.html

## Start with UI5 Project

1. Clone Github repository https://github.com/integrtr/UI5Con2024-Workshop.git (Downloading as zip file and importing also works)
2. Install dependencies with `npm install`
3. Start local server with `npm start` to verify all setup
4. Run `npm run build` to prepare build file of project. This should create a `dist` folder in your workspace.

## Creating a custom task

1. Create a folder in project named `lib`
2. Create `task` folder inside `lib` folder for custom tasks
3. Create a file `debuggerRemover.js` and place below file content and save

```JavaScript
const path = require("node:path");

/*
 * Remove all 'debugger' statements from JavaScript files in the project
 */
module.exports = async function ({
  dependencies,
  log,
  options,
  taskUtil,
  workspace,
}) {
  const { createResource } = taskUtil.resourceFactory;
  const jsResources = await workspace.byGlob("**/*.js");
  await Promise.all(
    jsResources.map(async (resource) => {
      const jsResourcePath = resource.getPath();

      log.info(`Processing JavaScript file ${jsResourcePath}...`);
      const originalContent = await resource.getString();
      const modifiedContent = originalContent.replace(
        /^\s*debugger;\s*$/gm,
        ""
      );

      if (originalContent !== modifiedContent) {
        log.info(`Removed debugger statement(s) from ${jsResourcePath}`);

        // Create a new resource with the modified content
        const modifiedResource = createResource({
          path: jsResourcePath,
          string: modifiedContent,
        });
        await workspace.write(modifiedResource);
      }
    })
  );
  log.info("Custom task to remove debugger statements completed");
};
```

## Configuring custom task in UI5 project

1. Open `ui5.yaml` in project root folder
2. At the end of file add below code to import custom task to UI5 project

```yaml
---
specVersion: "3.0"
kind: extension
type: task
metadata:
  name: ui5-task-debugger-remover
task:
  path: lib/task/debuggerRemover.js
```

3. Configure custom task with project by adding below code in builder > customTasks. (After line number `7` in `ui5.yaml`

```yaml
- name: ui5-task-debugger-remover
  beforeTask: generateComponentPreload
  configuration:
    path: /resources
```

4. Save `ui5.yaml` and run `npm run build`

> Checkout to `withCustomTask` branch to get UI5 project with `ui5-task-debugger-removed` task configured - https://github.com/integrtr/UI5Con2024-Workshop/tree/withCustomTask

### Verifying custom task processing

1. Add multiple `debugger;` keywords in your `webapp` JavaScript files.
2. Run `npm run build` in terminal
3. Check `dist` folder files to verify if `debugger;` keywords are removed.

## Guidelines to build custom middleware and tasks

- Custom tasks name are often prefixed with `ui5-task-`
- Custom middleware names are often prefixed with `ui5-middleware-`
- Make sure to use `log.info` wherever possible. Helps other developers to understand your code.
- Provide user arguments instead of hardcoding values to make it more generic and productive
- Handle maximum error scenarios to make solutions stable

## Contibution to UI5 Community

You can submit your custom tasks and middlewares to UI5 Community at https://github.com/ui5-community/ui5-ecosystem-showcase.

- Create new UI5 tooling task and middleware
- Extend existing UI5 tooling task and middleware
- Support for issues and improvements required for existing solutions
