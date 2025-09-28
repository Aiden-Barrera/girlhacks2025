import { useEffect, useRef, useState } from 'react'
import { Card, Progress, Button, Typography, Row, Col, Space, Input, Modal, message, Checkbox, List } from 'antd'
import { RocketOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons'
import mermaid from 'mermaid'

const { Title, Paragraph } = Typography

function PathwayPage() {
  const mermaidRef = useRef(null)
  const [pathways, setPathways] = useState([])
  const [currentPathway, setCurrentPathway] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [experience, setExperience] = useState('')
  const [desiredRole, setDesiredRole] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPathways()
  }, [])

  const fetchPathways = async () => {
    try {
      const response = await fetch('/api/pathways', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setPathways(data.pathways)
        if (data.pathways.length > 0) {
          setCurrentPathway(data.pathways[0]) // Use the first pathway
        }
      } else {
        message.error('Failed to fetch pathways')
      }
    } catch (error) {
      console.error('Error fetching pathways:', error)
      message.error('Error loading pathways')
    }
  }

  const parseMermaidFromLLM = (llmOutput) => {
    return llmOutput.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim()
  }

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    })
    
    const renderDiagram = async () => {
      if (mermaidRef.current && currentPathway?.mermaid) {
        try {
          const parsedMermaid = parseMermaidFromLLM(currentPathway.mermaid)
          const { svg } = await mermaid.render('mermaid-diagram', parsedMermaid)
          mermaidRef.current.innerHTML = svg
          
          // Add click listeners to nodes
          setTimeout(() => {
            const nodes = mermaidRef.current.querySelectorAll('g.node')
            console.log('Found nodes:', nodes.length)
            nodes.forEach((node, index) => {
              node.style.cursor = 'pointer'
              node.addEventListener('click', (e) => {
                e.preventDefault()
                console.log('Node clicked, index:', index)
                const level = currentPathway.levels?.[index]
                if (level) {
                  console.log('Setting selected level:', level.levelNumber)
                  setSelectedLevel(level)
                }
              })
            })
          }, 500)
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          mermaidRef.current.innerHTML = '<p>Error loading diagram</p>'
        }
      }
    }
    
    if (currentPathway) {
      renderDiagram()
    }
  }, [currentPathway])

  const generatePathway = async () => {
    if (!experience.trim() || !desiredRole.trim()) {
      message.error('Please fill in both fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agent/pathway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: `Current experience: ${experience}. Desired role: ${desiredRole}. Please create a career pathway.`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        message.success('Pathway generated successfully!')
        setShowModal(false)
        setExperience('')
        setDesiredRole('')
        // Refresh pathways
        await fetchPathways()
      } else {
        message.error(data.message || 'Failed to generate pathway')
      }
    } catch (error) {
      console.error('Error generating pathway:', error)
      message.error('Error generating pathway')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={1} style={{ color: '#1890ff', marginBottom: '8px' }}>
            <RocketOutlined /> Your Career Pathway
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666' }}>
            Visualize your journey and track your progress towards your dream career
          </Paragraph>
        </div>

        {/* Questionnaire Section */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '24px' }}>Tell Us About Your Journey</Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                  What experience do you currently have?
                </label>
                <Input.TextArea
                  placeholder="Describe your current skills, education, or work experience..."
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Space>
            </Col>
            
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                  What role do you want to achieve?
                </label>
                <Input.TextArea
                  placeholder="Describe your dream job or career goal..."
                  rows={4}
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </Space>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<RocketOutlined />}
              onClick={() => setShowModal(true)}
              style={{ height: '50px', fontSize: '16px', padding: '0 32px' }}
            >
              Generate My Pathway
            </Button>
          </div>
        </Card>

        <Modal
          title="Generate New Pathway"
          open={showModal}
          onOk={generatePathway}
          onCancel={() => setShowModal(false)}
          okText="Yes, Generate Pathway"
          cancelText="Cancel"
          confirmLoading={loading}
        >
          <p>Creating a new pathway will add to your existing pathways. Are you sure you want to continue?</p>
        </Modal>

        {/* Level Steps Display */}
        {selectedLevel && (
          <Card 
            title={`${selectedLevel.title} - ${selectedLevel.duration}`}
            style={{ marginBottom: '24px', border: '2px solid #1890ff' }}
            extra={<Button onClick={() => setSelectedLevel(null)}>Close</Button>}
          >
            {selectedLevel.steps?.map((step, stepIndex) => (
              <Card 
                key={stepIndex}
                type="inner" 
                title={step.title}
                style={{ marginBottom: '16px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {step.tasks?.map((task, taskIndex) => (
                    <Checkbox 
                      key={taskIndex}
                      checked={task.status === 'completed'}
                      onChange={(e) => {
                        console.log('Task toggled:', task.title, e.target.checked)
                      }}
                    >
                      {task.title}
                    </Checkbox>
                  ))}
                </Space>
              </Card>
            ))}
          </Card>
        )}

        {/* Pathway Visualization */}
        {currentPathway && (
          <Card 
            title={
              <Space>
                <RocketOutlined />
                <span>Your Career Pathway</span>
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <div style={{ 
              overflow: 'auto', 
              padding: '20px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              textAlign: 'center'
            }}>
              <div ref={mermaidRef} style={{ minHeight: '400px', minWidth: '800px' }}></div>
              <Title level={4} style={{ marginTop: '16px', color: '#1890ff' }}>
                {currentPathway?.title}
              </Title>
            </div>
          </Card>
        )}

        {/* No pathways message */}
        {pathways.length === 0 && (
          <Card style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={4}>No Pathways Yet</Title>
            <Paragraph>Generate your first career pathway using the form above!</Paragraph>
          </Card>
        )}

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button 
              size="large" 
              icon={<SaveOutlined />}
              style={{ height: '50px', fontSize: '16px', padding: '0 32px' }}
              onClick={fetchPathways}
            >
              Refresh Pathways
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default PathwayPage
