const loginModal = {
  isOpen: false,

  onOpen() {
    this.isOpen = true;
  },

  onClose() {
    this.isOpen = false;
  },
};
export default loginModal;
