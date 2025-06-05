import styled from 'styled-components'

const Labels = styled.label`
  display: inline-block;
  padding: 5px 16px;
  font-weight: 600;
  font-size: 20px;
  width: ${({ isCheckbox }) => {
    if (!isCheckbox) return '400px'
  }};
  color: var(--ba-text-black);

  ${({ invalid }) => {
    if (invalid) return `color: var(--ba-text-red)`
  }}

  @media (max-width: 1200px) {
    font-size: 15px;
    width: 100%;
    padding: 0.9vh;
  }
`

export default Labels
