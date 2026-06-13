class PasswordGenerator {
  selectors = {
    root: "[data-js-password-generator]",
    output: "[data-js-password-generator-outup]",
    copyLabel: "[data-js-password-generator-label-copy]",
    copyButton: "[data-js-password-generator-copy-btn]",
    range: "[data-js-password-generator-range]",
    rangeValue: "[data-js-password-generator-range-value]",
    checkboxUppercase: "[data-js-password-generator-checkbox-uppercase]",
    checkboxLowercase: "[data-js-password-generator-checkbox-lowercase]",
    checkboxNumbers: "[data-js-password-generator-checkbox-numbers]",
    checkboxSymbols: "[data-js-password-generator-checkbox-symbols]",
    meter: "[data-js-password-generator-meter]",
    meterBar: "[data-js-password-generator-meter-bar]",
    meterText: "[data-js-password-generator-meter-text]",
  };

  stateClasses = {
    isActive: "is-active",
    isCopy: "is-copy",
    isVisible: "is-visible",
    isPlaceholder: "is-placeholder",
  };

  attributes = {
    ariaValueNow: "aria-valuenow",
    ariaValueText: "aria-valuetext",
  };

  charSets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  levelStrength = ["TOO WEAK!", "WEAK", "MEDIUM", "STRONG"];

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.outputElement = this.rootElement.querySelector(this.selectors.output);
    this.copyLabelElement = this.rootElement.querySelector(
      this.selectors.copyLabel,
    );
    this.copyButtonElement = this.rootElement.querySelector(
      this.selectors.copyButton,
    );
    this.rangeElement = this.rootElement.querySelector(this.selectors.range);
    this.rangeValueElement = this.rootElement.querySelector(
      this.selectors.rangeValue,
    );
    this.checkboxUppercaseElement = this.rootElement.querySelector(
      this.selectors.checkboxUppercase,
    );
    this.checkboxLowercaseElement = this.rootElement.querySelector(
      this.selectors.checkboxLowercase,
    );
    this.checkboxNumbersElement = this.rootElement.querySelector(
      this.selectors.checkboxNumbers,
    );
    this.checkboxSymbolsElement = this.rootElement.querySelector(
      this.selectors.checkboxSymbols,
    );
    this.meterElement = this.rootElement.querySelector(this.selectors.meter);
    this.meterBarElements = this.rootElement.querySelectorAll(
      this.selectors.meterBar,
    );
    this.meterTextElement = this.rootElement.querySelector(
      this.selectors.meterText,
    );
    this.bindEvents();
  }

  updateRangeProgress = () => {
    const value = this.rangeElement.value;
    const min = this.rangeElement.min || 0;
    const max = this.rangeElement.max || 20;
    const percent = ((value - min) / (max - min)) * 100;
    this.rangeElement.style.setProperty("--value", `${percent}%`);
    this.rangeValueElement.textContent = value;
    this.rangeElement.setAttribute(this.attributes.ariaValueNow, value);
    this.rangeElement.setAttribute(
      this.attributes.ariaValueText,
      `${value} symbols`,
    );
  };

  generatePassword(length, hasUpper, hasLower, hasNumbers, hasSymbols) {
    let availableChars = "";
    let password = "";
    if (hasUpper) availableChars += this.charSets.upper;
    if (hasLower) availableChars += this.charSets.lower;
    if (hasNumbers) availableChars += this.charSets.numbers;
    if (hasSymbols) availableChars += this.charSets.symbols;

    if (availableChars.length === 0) return "";

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % availableChars.length;
      password += availableChars[randomIndex];
    }
    return password;
  }

  updateStrength(level) {
    this.meterBarElements.forEach(bar =>
      bar.classList.remove(this.stateClasses.isActive),
    );
    for (let i = 0; i < level; i++) {
      if (this.meterBarElements[i]) {
        this.meterBarElements[i].classList.add(this.stateClasses.isActive);
      }
    }

    this.meterElement.setAttribute(this.attributes.ariaValueNow, level);
    this.meterElement.setAttribute(
      this.attributes.ariaValueText,
      this.levelStrength[level - 1] || "",
    );

    this.meterTextElement.textContent = this.levelStrength[level - 1] || "";
    if (level > 0) {
      this.meterTextElement.classList.add(this.stateClasses.isVisible);
    } else {
      this.meterTextElement.classList.remove(this.stateClasses.isVisible);
    }
  }

  renderNewPassword() {
    const length = parseInt(this.rangeElement.value, 10);
    const options = {
      upper: this.checkboxUppercaseElement.checked,
      lower: this.checkboxLowercaseElement.checked,
      numbers: this.checkboxNumbersElement.checked,
      symbols: this.checkboxSymbolsElement.checked,
    };
    const password = this.generatePassword(
      length,
      options.upper,
      options.lower,
      options.numbers,
      options.symbols,
    );
    if (password === "") {
      this.outputElement.textContent = "Select options...";
      this.outputElement.classList.add(this.stateClasses.isPlaceholder);
      this.updateStrength(0);
      return;
    }
    this.outputElement.textContent = password;
    this.outputElement.classList.remove(this.stateClasses.isPlaceholder);
    const strength = this.evaluateStrength(password, options);
    this.updateStrength(strength);
    this.copyLabelElement.classList.remove(this.stateClasses.isCopy);
  }

  evaluateStrength(password, options) {
    if (!password) return 0;

    const length = password.length;
    const typesCount = [
      options.upper,
      options.lower,
      options.numbers,
      options.symbols,
    ].filter(Boolean).length;
    if (length < 6 || typesCount <= 1) return 1;
    if (length < 10 && typesCount <= 2) return 2;
    if (length >= 10 && typesCount <= 3) return 3;
    if (length >= 16 && typesCount === 4) return 4;

    return 3;
  }

  async copyToClipboard() {
    const password = this.outputElement.textContent;
    if (
      !password ||
      this.outputElement.classList.contains(this.stateClasses.isPlaceholder)
    )
      return;

    try {
      await navigator.clipboard.writeText(password);
      this.copyLabelElement.classList.add(this.stateClasses.isCopy);
      setTimeout(() => {
        this.copyLabelElement.classList.remove(this.stateClasses.isCopy);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  bindEvents() {
    this.rootElement.addEventListener("submit", event => {
      event.preventDefault();
      this.renderNewPassword();
    });
    this.copyButtonElement.addEventListener("click", () =>
      this.copyToClipboard(),
    );
    this.rangeElement.addEventListener("click", this.updateRangeProgress);
  }
}

new PasswordGenerator();
