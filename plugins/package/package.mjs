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
    },
    slot(name, content) {
      if (name === 'about') {
        content+=`
          <% if (typeof packageJson !== 'undefined') { %>
            <h4>Version</h4>
            <div>
              <%- packageJson.version %>
            </div>
            <% if (packageJson.repository) { %>
              <h4>Repository</h4>
              <div>
                <a href="<%- packageJson.repository.url %>">
                  <%- packageJson.repository.url.replace(/^https?:\\/\\//, '') %>
                </a>
              </div>
            <% } %>
          <% } %>
        `;
      }

      if (name === 'links') {
        content+= `
          <% if (typeof packageJson !== 'undefined') { %>
            <% if (packageJson.repository) { %>
              <a href="<%- packageJson.repository.url %>">
                <%
                  const brand = packageJson.repository.url.replace('https://', '').split('/')[0].split('.')[0];
                %>
                <%- icon(brand, { category: 'brands' }) %>
                <!--<label><%- brand %></label>-->
              </a>
            <% } %>
          <% } %>
        `;
      }

      return content;
    }
  };
}

export default packageJson;
