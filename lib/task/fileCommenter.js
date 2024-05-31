const path = require("node:path");

/*
 * Add a banner comment to all JavaScript files in the project
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
  const comment =
    "/* Should not be used for productive usage. */\n/* Author: TheVivekGowda, NitishMehta */\n\n\n";

  await Promise.all(
    jsResources.map(async (resource) => {
      const jsResourcePath = resource.getPath();

      log.info(`Adding comment to JavaScript file ${jsResourcePath}...`);
      const originalContent = await resource.getString();
      const modifiedContent = comment + originalContent;

      if (!originalContent.startsWith(comment)) {
        log.info(`Added comment to ${jsResourcePath}`);

        const modifiedResource = createResource({
          path: jsResourcePath,
          string: modifiedContent,
        });
        await workspace.write(modifiedResource);
      }
    })
  );
  log.info("Custom task to add comment to JavaScript files completed");
};
