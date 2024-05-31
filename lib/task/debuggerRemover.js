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
