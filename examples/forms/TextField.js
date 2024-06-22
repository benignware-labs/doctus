/**
 * @namespace examples
 */

/**
 * @namespace examples.forms
 * @memberof examples
 */

/**
 * @memberof examples.forms
 * @description Represents a text input field component.
 */
class TextField {
  /**
   * @constructor
   * @param {string} label - The label for the text field.
   */
  constructor(label) {
    this.label = label;
  }

  /**
   * @method render
   * @description Renders the text field component.
   * @returns {string} The rendered HTML markup.
   */
  render() {
    return `<div class="text-field">
              <label>${this.label}</label>
              <input type="text" />
            </div>`;
  }
}

module.exports = TextField;