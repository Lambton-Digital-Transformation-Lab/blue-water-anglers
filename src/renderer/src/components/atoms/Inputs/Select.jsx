import styled from 'styled-components'

const Select = styled.select`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 15px;
  background-color: var(--ba-button-white);
  color: var(--ba-text-black);

  &:disabled {
    background-color: var(--ba-Select-locked);
    cursor: not-allowed;
  }

  @media (max-width: 1200px) {
    font-size: 15px;
  }
`

export default Select
