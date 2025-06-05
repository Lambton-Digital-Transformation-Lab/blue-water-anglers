import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

import { Header } from '../../organisms/Header/Header'
import { Button } from '../../atoms'

import { imageMap } from '../../../assets/docs'

// Resolve Image Paths
const resolveImagePlaceholders = (content) => {
  return content.replace(/\{\{img:(.+?)\}\}/g, (_, key) => {
    const src = imageMap[key.trim()]
    return src ? `![${src}](${src})` : ''
  })
}

export const DocumentationTemplate = ({ content }) => {
  const resolved = resolveImagePlaceholders(content)
  const navigate = useNavigate()
  return (
    <div className="doc-container">
      <Header displayMenus={false}>
        <Button variant={'regular'} onClick={() => navigate('/documentation')}>
          BACK TO HELP
        </Button>
      </Header>
      <div className="doc-template-container">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{resolved}</ReactMarkdown>
      </div>
    </div>
  )
}

DocumentationTemplate.propTypes = {
  content: PropTypes.any
}
