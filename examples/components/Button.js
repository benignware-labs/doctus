/**
 * @namespace examples.components
 * @memberOf examples
 */

/**
 * Represents a button component.
 * @memberof examples.components
 * @extends examples.components.Base
 */
class Button extends Base {
  /**
   * Creates a new Button instance.
   * @param {string} text - The text to display on the button.
   * @param {function} onClick - The click event handler for the button.
   */
  constructor(text, onClick) {
    super();
    this.text = text;
    this.onClick = onClick;
  }

  /**
   * Renders the button component.
   * @returns {HTMLElement} The rendered button element.
   */
  render() {
    const button = document.createElement('button');
    button.textContent = this.text;
    button.addEventListener('click', this.onClick);
    return button;
  }
}


/**
 * Represents an outline button component.
 * @memberof examples.components
 * @extends examples.components.Button
 */
class OutlineButton extends Button {
  /**
   * Creates a new OutlineButton instance.
   * @param {string} text - The text to display on the button.
   * @param {function} onClick - The click event handler for the button.
   */
  constructor(text, onClick) {
    super(text, onClick);
  }
  /**
   * Renders the outline button component.
   * @returns {HTMLElement} The rendered outline button element.
   */
  render() {
    const button = super.render();
    button.classList.add('outline-button');
    return button;
  }
}

/**
 * Represents a form control component.
 * @memberof examples.forms
 * @extends examples.components.Base
 */
class FormControl extends Base {
  /**
   * Creates a new FormControl instance.
   * @param {string} label - The label for the form control.
   * @param {string} value - The initial value of the form control.
   * @param {function} onChange - The change event handler for the form control.
   */
  constructor(label, value, onChange) {
    super();
    this.label = label;
    this.value = value;
    this.onChange = onChange;
  }
  /**
   * Renders the form control component.
   * @returns {HTMLElement} The rendered form control element.
   */
  render() {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = this.label;
    const input = document.createElement('input');
    input.value = this.value;
    input.addEventListener('change', this.onChange);
    container.appendChild(label);
    container.appendChild(input);
    return container;
  }
}

/**
 * Represents a checkbox form control component.
 * @memberof examples.forms
 * @extends FormControl
 */
class CheckboxControl extends FormControl {
  /**
   * Creates a new CheckboxControl instance.
   * @param {string} label - The label for the checkbox control.
   * @param {boolean} checked - The initial checked state of the checkbox control.
   * @param {function} onChange - The change event handler for the checkbox control.
   */
  constructor(label, checked, onChange) {
    super(label, checked, onChange);
  }
  /**
   * Renders the checkbox form control component.
   * @returns {HTMLElement} The rendered checkbox control element.
   */
  render() {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = this.label;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.value;
    checkbox.addEventListener('change', this.onChange);
    container.appendChild(label);
    container.appendChild(checkbox);
    return container;
  }
}

/**
 * An example plain function.
 * @param {string} name - The name parameter.
 * @returns {string} The greeting message.
 */
function greet(name) {
  return `Hello, ${name}!`;
}
/**
 * Represents a plain function.
 * @param {string} name - The name of the function.
 * @param {number} age - The age of the function.
 * @returns {string} The result of the function.
 */
function plainFunction(name, age) {
  // Function logic goes here
  return `Hello, ${name}! You are ${age} years old.`;
}

/**
 * @namespace examples.utils
 */
/**
 * Represents a utility function.
 * @memberof components
 * @param {string} message - The message to display.
 */
function showMessage(message) {
  console.log(message);
}
