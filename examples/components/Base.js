/**
 * Represents a base component.
 * @memberof examples.components
 * @class
 */
class Base {
  /**
   * Creates a new instance of the Base class.
   * @constructor
   * @param {string} name - The name of the component.
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Gets the name of the component.
   * @returns {string} The name of the component.
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the name of the component.
   * @param {string} name - The new name of the component.
   */
  setName(name) {
    this.name = name;
  }
}

// Export the Base class
export default Base;