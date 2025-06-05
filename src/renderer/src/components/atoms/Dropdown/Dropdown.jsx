import styled from 'styled-components'

const Dropdown = styled.select`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  background-color: var(--ba-button-white);
  color: var(--ba-text-black);

  &:disabled {
    background-color: var(--ba-input-locked);
    cursor: not-allowed;
  }
`

export default Dropdown
