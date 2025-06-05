import { Input, Labels } from '../../atoms'
import PropTypes from 'prop-types'

export const FormField = ({
  invalid = undefined,
  label = 'default',
  type = 'text',
  name = '',
  value = '',
  disabled = false,
  onChange = () => {}
}) => {
  const isCheckbox = type === 'checkbox'

  return (
    <div className="form-field-container">
      <Labels isCheckbox={isCheckbox} className="form__labels" htmlFor={name} invalid={invalid}>
        {label}
      </Labels>
      <Input
        disabled={disabled}
        id={name}
        name={name}
        type={type}
        onChange={onChange}
        {...(isCheckbox ? { checked: value } : { value })}
      />
    </div>
  )
}

FormField.propTypes = {
  invalid: PropTypes.bool,
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onChange: PropTypes.func
}
