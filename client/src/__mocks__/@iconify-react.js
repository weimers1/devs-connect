// Mock for @iconify/react
const Icon = ({ icon, ...props }) => {
  return `<span data-testid="icon" data-icon="${icon}" {...props}></span>`;
};

module.exports = { Icon };