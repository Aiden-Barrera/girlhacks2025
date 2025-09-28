import { useEffect, useRef, useState } from 'react'
import { Card, Select, Progress, Button, Typography, Row, Col, Space } from 'antd'
import { RocketOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons'
import mermaid from 'mermaid'

const { Title, Paragraph } = Typography
const { Option } = Select

function PathwayPage() {
  const mermaidRef = useRef(null)
  const [selectedCareer, setSelectedCareer] = useState('software-engineer')

  const careerPaths = {
    'software-engineer': {
      title: 'Software Engineer Pathway',
      description: 'Complete roadmap to becoming a software engineer',
      progress: 25,
      diagram: `
        graph TD
          A[Start: Programming Basics] --> B[Learn a Programming Language]
          B --> C[Data Structures & Algorithms]
          C --> D[Version Control - Git]
          D --> E[Web Development Basics]
          E --> F[Database Fundamentals]
          F --> G[Framework Learning]
          G --> H[Build Projects]
          H --> I[System Design]
          I --> J[Job Ready!]
          
          B --> B1[Python/JavaScript/Java]
          E --> E1[HTML/CSS/JavaScript]
          F --> F1[SQL/NoSQL]
          G --> G1[React/Node.js/Spring]
          H --> H1[Portfolio Projects]
      `
    },
    'cybersecurity': {
      title: 'Cybersecurity Specialist Pathway',
      description: 'Your journey to cybersecurity expertise',
      progress: 15,
      diagram: `
        graph TD
          A[Start: IT Fundamentals] --> B[Networking Basics]
          B --> C[Operating Systems]
          C --> D[Security Fundamentals]
          D --> E[Risk Assessment]
          E --> F[Incident Response]
          F --> G[Security Tools]
          G --> H[Certifications]
          H --> I[Specialization]
          I --> J[Security Expert!]
          
          B --> B1[TCP/IP, OSI Model]
          C --> C1[Linux/Windows]
          D --> D1[CIA Triad, Threats]
          G --> G1[Wireshark, Nmap]
          H --> H1[Security+, CISSP]
          I --> I1[Penetration Testing/Forensics]
      `
    },
    'data-science': {
      title: 'Data Science Pathway',
      description: 'Transform data into insights',
      progress: 35,
      diagram: `
        graph TD
          A[Start: Math & Statistics] --> B[Programming - Python/R]
          B --> C[Data Analysis Libraries]
          C --> D[Data Visualization]
          D --> E[Machine Learning]
          E --> F[Deep Learning]
          F --> G[Big Data Tools]
          G --> H[Portfolio Projects]
          H --> I[Data Scientist!]
          
          A --> A1[Linear Algebra, Statistics]
          C --> C1[Pandas, NumPy]
          D --> D1[Matplotlib, Seaborn]
          E --> E1[Scikit-learn]
          F --> F1[TensorFlow, PyTorch]
          G --> G1[Spark, Hadoop]
      `
    }
  }

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })
    
    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          const { svg } = await mermaid.render('mermaid-diagram', careerPaths[selectedCareer].diagram)
          mermaidRef.current.innerHTML = svg
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          mermaidRef.current.innerHTML = '<p>Error loading diagram</p>'
        }
      }
    }
    
    renderDiagram()
  }, [selectedCareer])

  const currentPath = careerPaths[selectedCareer]

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

        {/* Career Selection */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <label style={{ fontWeight: 'bold', color: '#333' }}>
                  Select Your Career Path:
                </label>
                <Select
                  value={selectedCareer}
                  onChange={setSelectedCareer}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="software-engineer">Software Engineer</Option>
                  <Option value="cybersecurity">Cybersecurity Specialist</Option>
                  <Option value="data-science">Data Scientist</Option>
                </Select>
              </Space>
            </Col>
            
            <Col xs={24} md={16}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  {currentPath.title}
                </Title>
                <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                  {currentPath.description}
                </Paragraph>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Progress Section */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4} style={{ margin: 0 }}>Your Progress</Title>
                <Progress 
                  percent={currentPath.progress} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  size="large"
                />
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  You're {currentPath.progress}% through your {currentPath.title.toLowerCase()} journey!
                </Paragraph>
              </Space>
            </Col>
            
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  size="large"
                  block
                >
                  Continue Learning
                </Button>
                <Button 
                  icon={<SaveOutlined />} 
                  size="large"
                  block
                >
                  Save Progress
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Pathway Visualization */}
        <Card 
          title={
            <Space>
              <RocketOutlined />
              <span>Learning Path Visualization</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <div style={{ 
            overflow: 'auto', 
            padding: '20px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}>
            <div ref={mermaidRef} style={{ minHeight: '400px', textAlign: 'center' }}></div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button 
              size="large" 
              icon={<SaveOutlined />}
              style={{ height: '50px', fontSize: '16px', padding: '0 32px' }}
            >
              Save Pathway
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default PathwayPage
