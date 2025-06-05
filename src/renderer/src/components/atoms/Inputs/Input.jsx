import styled from 'styled-components'

const Input = styled.input`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  margin: 10px 0;
  font-size: 18px;
  background-color: var(--ba-button-white);
  color: var(--ba-text-black);

  &[type='checkbox'] {
    width: 24px;
    height: 24px;
    accent-color: #007bff; /* optional: modern browsers */
    cursor: pointer;
    margin-right: 8px;
  }

  &:disabled {
    background-color: var(--ba-input-locked);
    cursor: not-allowed;
  }

  @media (max-width: 1200px) {
    font-size: 15px;
  }
`

export default Input
