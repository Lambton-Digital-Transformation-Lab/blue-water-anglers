import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../organisms/Header/Header'
import { FormField } from '../molecules'
import { Button } from '../atoms'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'username') {
      setUsername(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }
  const handleLogin = async () => {
    const loginData = { username, password }
    const result = await window.electron.auth.login(loginData)
    if (result === 'admin') {
      navigate('/')
    } else {
      setError('Invalid Username or Password')
    }
  }

  return (
    <>
      <Header displayMenus={false} />
      <div className="login-container">
        {error && <div>{error}</div>}
        <FormField
          label="USERNAME"
          type="text"
          name="username"
          value={username}
          onChange={handleChange}
        />
        <FormField
          label="PASSWORD"
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
        />
        <Button variant="submit" onClick={handleLogin}>
          LOGIN
        </Button>
        <Button variant="regular" onClick={() => navigate('/')}>
          CANCEL
        </Button>
      </div>
    </>
  )
}
