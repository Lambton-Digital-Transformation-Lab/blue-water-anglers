import { useNavigate } from 'react-router-dom'
import { Button } from '../../atoms'
import { Header } from '../../organisms'
import { docs } from './markdown'

export const IntroDocsPage = () => {
  const navigate = useNavigate()
  return (
    <>
      <Header displayMenus={false}>
        <Button variant={'regular'} onClick={() => navigate('/')}>
          BACK TO DASHBOARD
        </Button>
      </Header>
      <div className="documentation-links">
        <h1>DOCUMENTATION & HELP</h1>
        {Object.entries(docs).map(([slug, { title }]) => (
          <Button key={slug} onClick={() => navigate(`/docs/${slug}`)}>
            {title}
          </Button>
        ))}
      </div>
    </>
  )
}
