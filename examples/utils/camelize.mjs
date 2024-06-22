/**
 * Converts a string to camel case.
 * @memberof examples.utils
 * @param {string} str - The string to convert.
 * @returns {string} The camel case version of the string.
 */
function camelize(str) {
  // Split the string into words
  const words = str.split(/[\s_-]+/);

  // Capitalize the first letter of each word except the first one
  const camelized = words.map((word, index) => {
    if (index === 0) {
      return word.toLowerCase();
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  });

  // Join the words back together
  return camelized.join('');
}