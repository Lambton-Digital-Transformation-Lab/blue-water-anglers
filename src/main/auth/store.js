import { Conf } from 'electron-conf'

const config = new Conf()

export const getRole = () => {
  return config.get('role', 'guest')
}

export const setRole = (role) => {
  config.set('role', role)
}
