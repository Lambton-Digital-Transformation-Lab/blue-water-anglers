import { useNavigate } from 'react-router-dom'
import logo from '../../../assets/bluewaterlogo.svg'

import { Button } from '../../atoms'
import PropTypes from 'prop-types'

export const Header = ({
  displayMenus = true,
  displayReportMenu = false,
  isAdmin = false,
  recordId = null,
  children
}) => {
  const navigate = useNavigate()

  return (
    <div id="header-component">
      <div className="header-logo-container">
        <img className="header-logo-image" src={logo} alt="Bluewater Angler Logo" />
        <h1 className="header-logo-text">BLUEWATER ANGLERS</h1>
      </div>

      {displayMenus && (
        <div className="header-menu">
          <Button onClick={() => navigate(`/addRecords/${recordId || ''}`)} variant={'regular'}>
            ADD / UPDATE DAILY REPORTS
          </Button>

          <Button
            onClick={() =>
              navigate(`/addRecords/${recordId || ''}`, {
                state: { addTanks: true }
              })
            }
            variant={'regular'}
          >
            {' '}
            ADD TANKS{' '}
          </Button>

          {isAdmin && (
            <Button onClick={() => navigate('/generateReports')} variant={'regular'}>
              GENERATE REPORTS
            </Button>
          )}
        </div>
      )}

      {displayReportMenu && (
        <div className="header-menu">
          <Button onClick={() => navigate('/')} variant={'regular'}>
            BACK TO MAIN SCREEN
          </Button>
          <Button onClick={() => navigate('/generateGraphs')} variant={'regular'}>
            GENERATE GRAPHS
          </Button>
        </div>
      )}

      {children && <div className="header-menu">{children}</div>}
    </div>
  )
}

Header.propTypes = {
  displayMenus: PropTypes.bool,
  displayReportMenu: PropTypes.bool,
  isAdmin: PropTypes.bool,
  recordId: PropTypes.string,
  children: PropTypes.any
}
