import logo from '../../../assets/bluewaterlogo.svg'

export const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-contents">
        <h2>LOADING</h2>
        <img src={logo} alt="Bluewater Logo" />
        <h2>PLEASE WAIT</h2>
      </div>
    </div>
  )
}
