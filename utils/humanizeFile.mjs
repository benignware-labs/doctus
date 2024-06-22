export const humanizeFile = (file) => {
  let name = file.replace(/\.[^.]+$/, ''); // Remove file extension
  name = name.replace(/[-_]/g, ' '); // Replace hyphens and underscores with spaces
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // Split camelCase into separate words
  name = name.replace(/\b\w/g, (match) => match.toUpperCase()); // Capitalize the first letter of each word
  return name;
}
