import installationGuide from './installationGuide.md?raw'
import uninstallationGuide from './uninstallationGuide.md?raw'
import restoreDatabaseGuide from './restoreDatabaseGuide.md?raw'
import contactInfo from './contactInfo.md?raw'

export const docs = {
  installation: {
    title: 'Installation Guide',
    content: installationGuide
  },
  uninstallation: {
    title: 'Uninstallation Guide',
    content: uninstallationGuide
  },
  restoreDatabase: {
    title: 'Restore Database Guide',
    content: restoreDatabaseGuide
  },
  contactInfo: {
    title: 'Need More Help?',
    content: contactInfo
  }
}
