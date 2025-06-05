import styled from 'styled-components'

const Button = styled.button`
  padding: 10px 16px;
  margin: 10px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
                background-color: var(--ba-button-white);
                color: var(--ba-text-black)
            `
      case 'login':
        return `
          background-color: var(--ba-button-grey);
          color: var(--ba-text-black);
        `
      case 'submit':
        return `
          background-color: var(--ba-button-green);
          color: var(--ba-text-black);
        `
      case 'logout':
        return `
          background-color: var(--ba-button-red);
          color: var(--ba-text-white);
        `
      case 'regular':
        return `
          background-color: var(--ba-button-light-grey);
          color: var(--ba-text-black);
        `
      default:
        return `
          background-color: var(--ba-button-old-color);
          color: var(--ba-text-black);
        `
    }
  }}

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: var(--ba-input-locked);
    cursor: not-allowed;
  }
`

export default Button
