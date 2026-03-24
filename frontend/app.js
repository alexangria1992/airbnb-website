import {
  createIcons,
  Search,
  Menu,
  X,
  BadgeDollarSign,
} from "https://unpkg.com/lucide@latest/dist/esm/lucide.js";
import registerModal from "./registerModal.js";
// Create a configuration object with only the icons you are using
createIcons({
  icons: { Search, Menu, X },
});
const userMenuButton = document.querySelector(".user-menu__button");
const userMenuDropdown = document.querySelector(".user-menu__dropdown");
const signupItem = document.querySelector("#signup-item");

// MODAL
let isOpen = false;
let isLoading = false;

let showModal = isOpen;
let errors = {};
function setShowModal(value) {
  showModal = value;
}

// later, when isOpen changes:
setShowModal(isOpen);

userMenuButton.addEventListener("click", function () {
  userMenuDropdown.classList.toggle("hidden");
});

signupItem.addEventListener("click", function () {
  registerModal.onOpen();
  renderRegisterModal();
});

function setLoading(value) {
  isLoading = value;
}

const closeRegisterModal = () => {
  registerModal.onClose();

  const existingModal = document.querySelector(".modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }
};

const createButton = ({
  label = "",
  onClick = () => {},
  disabled = false,
  outline = false,
  small = false,
  iconHTML = "",
  type = "button",
  extraClass = "",
} = {}) => {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <button
    type=${type}
      class="button transition ${outline ? "button--outline" : ""} ${small ? "button--small" : ""} ${disabled ? "button--disabled" : ""} ${extraClass}"
      ${disabled ? "disabled" : ""}
    >
      ${iconHTML ? `<span class="button__icon-wrapper">${iconHTML}</span>` : ""}
      ${label}
    </button>
  `;

  const button = wrapper.querySelector("button");
  button.addEventListener("click", onClick);
  button.disabled = disabled;
  return button;
};

const createModal = ({
  isOpen = false,
  footer = null,
  title = "hello world",
  body = "",
  actionLabel = "Submit",
  onClose = () => {},
  onSubmit = () => {},
  disabled = false,
  secondaryActionLabel = "",
  secondaryAction = null,

  handleSecondaryAction = () => {},
} = {}) => {
  setShowModal(isOpen);

  if (!isOpen) {
    return;
  }

  const modalElement = document.createElement("div");

  modalElement.innerHTML = `
    <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content transition modal-content--closed ">
          <div class="modal-content__wrapper">
            <div class="modal-content__header">
                <button  class="modal-close__button transition">
                  <i data-lucide="x" class="modal-close__icon"></i>
                </button>
                <div class="login-modal">
                  ${title}
                </div>
            </div>
            <!--BODY -->
            <div class="modal-content__body">
              ${body}
            </div>
            <!-- footer--> 
            <div class="modal-content__footer-container">
              <div class="modal-content__footer-button">
              </div>
                <div class="modal-content__footer-extra"></div>

            </div>
          </div>
      </div>
    </div>
    </div>
  `;
  document.body.appendChild(modalElement);
  createIcons({
    icons: { X },
  });

  const handleClose = () => {
    if (disabled) return;
    setShowModal(false);

    const content = modalElement.querySelector(".modal-content");

    if (content) {
      content.classList.remove("modal-content--open");
      content.classList.add("modal-content--closed");
    }

    setTimeout(() => {
      onClose();
      modalElement.remove();
    }, 300);
  };

  const content = modalElement.querySelector(".modal-content");
  requestAnimationFrame(() => {
    content.classList.remove("modal-content--closed");
    content.classList.add("modal-content--open");
  });
  const footerButtonContainer = modalElement.querySelector(
    ".modal-content__footer-button",
  );
  const footerExtraContainer = modalElement.querySelector(
    ".modal-content__footer-extra",
  );

  if (secondaryAction && secondaryActionLabel) {
    const firstButton = createButton({
      disabled,
      label: secondaryActionLabel,
      onClick: handleSecondaryAction,
      outline: true,
    });
    footerButtonContainer.appendChild(firstButton);
  }
  const secondButton = createButton({
    disabled,
    label: actionLabel,
    onClick: onSubmit,
  });

  footerButtonContainer.appendChild(secondButton);
  if (footer) {
    footerExtraContainer.innerHTML = footer;
  }

  const closeButton = document.querySelector(".modal-close__button");

  closeButton.addEventListener("click", handleClose);
};

// Register Heading
const createHeading = ({ title = "", subtitle = "", center = false }) => {
  return `
  <div class="heading ${center ? "heading--center" : "heading--left"}"
  >
    <div class="heading__title">
      ${title}
    </div>
    <div class="heading__subtitle">${subtitle}</div>
    </div>
  
 `;
};

const handleRegisterSubmit = async () => {
  const emailValue = document.querySelector("#email")?.value.trim() || "";
  const nameValue = document.querySelector("#name")?.value.trim() || "";
  const passwordValue = document.querySelector("#password")?.value.trim() || "";

  errors = {};

  if (!emailValue) errors.email = true;
  if (!nameValue) errors.name = true;
  if (!passwordValue) errors.password = true;
  updateInputErrors();

  if (Object.keys(errors).length > 0) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  console.log("submit ok", {
    email: emailValue,
    name: nameValue,
    password: passwordValue,
  });

  setLoading(true);

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue,
        name: nameValue,
        password: passwordValue,
      }),
    });

    if (!response.ok) {
      throw new Error("Register failed");
    }

    console.log("submit ok");
    closeRegisterModal();
    showToast("Account created.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong", "error");
  } finally {
    setLoading(false);
  }
};

const updateInputErrors = () => {
  const emailInput = document.querySelector("#email");
  const nameInput = document.querySelector("#name");
  const passwordInput = document.querySelector("#password");

  const emailLabel = document.querySelector('label[for="email"]');
  const nameLabel = document.querySelector('label[for="name"]');
  const passwordLabel = document.querySelector('label[for="password"]');

  const setErrorState = (input, label, hasError) => {
    input.classList.toggle("input-field__input--error", hasError);
    input.classList.toggle("input-field__input--default", !hasError);

    label.classList.toggle("input-field__label--error", hasError);
    label.classList.toggle("input-field__label--default", !hasError);
  };

  setErrorState(emailInput, emailLabel, !!errors.email);
  setErrorState(nameInput, nameLabel, !!errors.name);
  setErrorState(passwordInput, passwordLabel, !!errors.password);
};

const createInput = ({
  id = "",
  label = "",
  type = "",
  disabled = false,
  formatPrice = false,
  required = false,
  hasError = false,
}) => {
  return `
    <div class="input-field">
      <div class="input-field__wrapper">
        ${formatPrice ? `<i data-lucide="badge-dollar-sign" class="input-field__price-icon"></i>` : ""}
        <input
          id="${id}"
            ${required ? "required" : ""}
            placeholder=""
            type="${type}"
            class="input-field__input transition
            ${formatPrice ? "input-field__input--with-price" : "input-field__input--normal"}
                    ${hasError ? "input-field__input--error" : "input-field__input--default"}

            "
            ${disabled ? "disabled" : ""}
            ${required ? "required" : ""}

        />
        <label for="${id}" class="input-field__label  ${formatPrice ? "input-field__label--price" : ""}
             ${hasError ? "input-field__label--error" : "input-field__label--default"}"

        
        
        >${label}</label>

      </div>
    </div>
  `;
};
const getBodyContent = () => `
  <div class="register-modal__body">
    ${createHeading({
      title: "Welcome to Airbnb",
      subtitle: "Create an account!",
      center: false,
    })}
    ${createInput({
      id: "email",
      label: "Email",
      type: "email",
      disabled: isLoading,
      required: true,
      hasError: !!errors.email,
    })}
        ${createInput({
          id: "name",
          label: "Name",

          required: true,
          disabled: isLoading,
          required: true,
          hasError: !!errors.name,
        })}
        ${createInput({
          id: "password",
          label: "Password",
          type: "password",
          required: true,
          disabled: isLoading,
          required: true,
          hasError: !!errors.password,
        })}
  </div>
`;

const renderRegisterModal = () => {
  createModal({
    isOpen: registerModal.isOpen,
    disabled: isLoading,
    title: "Register",
    actionLabel: "Continue",
    onClose: () => registerModal.onClose(),
    body: getBodyContent(),
    onSubmit: handleRegisterSubmit,
    footer: createRegisterFooter(),
  });
  const googleButton = document.querySelector(".register-modal__google-button");
  googleButton?.addEventListener("click", () => {
    console.log("Google auth clicked");
  });

  document
    .querySelector(".register-modal__google-button")
    ?.addEventListener("click", () => {
      console.log("Google auth clicked");
    });

  document
    .querySelector(".register-modal__github-button")
    ?.addEventListener("click", () => {
      console.log("Github auth clicked");
    });
  document
    .querySelector(".register-modal__login-link")
    ?.addEventListener("click", () => {
      registerModal.onClose();
      loginModal.onOpen();
    });
};

const showToast = (message, type = "error") => {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--show");
  });
  setTimeout(() => {
    toast.classList.remove("toast--show");

    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 3000);
};

const createRegisterFooter = () => {
  const googleButton = createButton({
    label: "Continue With Google",
    outline: true,
    iconHTML: `  <svg
    class="button__icon"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.8-.1-1.1H12z"/>
    <path fill="#34A853" d="M3.5 7.3l3.2 2.3C7.6 7.8 9.6 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 8.3 2.5 5.1 4.6 3.5 7.3z"/>
    <path fill="#FBBC05" d="M12 21.5c2.5 0 4.7-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.3 1.1-3.9 0-5.3-2.6-5.5-3.8l-3.1 2.4c1.5 2.9 4.5 5 8.6 5z"/>
    <path fill="#4285F4" d="M21.5 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.2-1 2.2-2 3l2.9 2.4c1.7-1.6 3.1-4 3.1-7.7z"/>
  </svg>`,
    extraClass: "register-modal__google-button",
    disabled: isLoading,
  });
  const githubButton = createButton({
    label: "Continue with Github",
    outline: true,
    iconHTML: `
    <svg
      class="button__icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.699-2.782.605-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  `,
    extraClass: "register-modal__github-button",
    disabled: isLoading,
  });
  return `
  <div class="register-modal__footer-content">
    <hr class="register-modal__footer-divider" />
    ${googleButton.outerHTML}
          ${githubButton.outerHTML}
 <div class="register-modal__bottom-text">
        <span class="register-modal__bottom-muted">Already have an account?</span>
        <button type="button" class="register-modal__login-link">Log in</button>
      </div>
  </div> `;
};
