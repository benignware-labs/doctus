import { join as pathJoin } from "path";
import readJsonSync from "read-json-sync";

const packageJson = (context) => {
  return {
    load() {
      const projectDir = process.cwd();
      const packageJsonPath = pathJoin(projectDir, 'package.json');
      const packageJson = readJsonSync(packageJsonPath);

      if (!packageJson) {
        return;
      }

      context.locals.packageJson = { ...packageJson };
      context.locals.site.title = packageJson.name;
      context.locals.site.description = packageJson.description;
    }
  };
}

export default packageJson;
