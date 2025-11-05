import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import './header.css'

function Header() {
  const location = useLocation()
  const [pageTitle, setPageTitle] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [dynamicText, setDynamicText] = useState('')

  useEffect(() => {
    const path = location.pathname
    const pathSegments = path.split('/').filter(segment => segment !== '')
    
    // Generate page title and breadcrumbs based on current route
    const generatePageInfo = () => {
      switch (path) {
        case '/':
          return {
            title: 'Welcome Home',
            breadcrumbs: [{ label: 'Home', path: '/' }],
            text: 'Find Your Dream Property'
          }
        case '/properties':
          return {
            title: 'Properties',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Properties', path: '/properties' }
            ],
            text: 'Browse Available Properties'
          }
        case '/properties/add':
          return {
            title: 'Add Property',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Properties', path: '/properties' },
              { label: 'Add Property', path: '/properties/add' }
            ],
            text: 'List Your Property'
          }
        case '/properties/my':
          return {
            title: 'My Properties',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Properties', path: '/properties' },
              { label: 'My Properties', path: '/properties/my' }
            ],
            text: 'Manage Your Listings'
          }
        case '/agents':
          return {
            title: 'Real Estate Agents',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Agents', path: '/agents' }
            ],
            text: 'Connect with Professional Agents'
          }
        case '/loans':
          return {
            title: 'Loan Services',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Loans', path: '/loans' }
            ],
            text: 'Secure Your Property Financing'
          }
        case '/visits':
          return {
            title: 'Property Visits',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Visits', path: '/visits' }
            ],
            text: 'Schedule Property Viewings'
          }
        case '/rent':
          return {
            title: 'Rent Management',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Rent Management', path: '/rent' }
            ],
            text: 'Manage Your Rental Properties'
          }
        case '/blogs':
          return {
            title: 'Real Estate Blog',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Blog', path: '/blogs' }
            ],
            text: 'Latest Market Insights & Tips'
          }
        case '/dashboard':
          return {
            title: 'Dashboard',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Dashboard', path: '/dashboard' }
            ],
            text: 'Your Property Portfolio Overview'
          }
        case '/profile':
          return {
            title: 'Profile Settings',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Profile', path: '/profile' }
            ],
            text: 'Manage Your Account Information'
          }
        case '/settings':
          return {
            title: 'Account Settings',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Settings', path: '/settings' }
            ],
            text: 'Customize Your Experience'
          }
        case '/notifications':
          return {
            title: 'Notifications',
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: 'Notifications', path: '/notifications' }
            ],
            text: 'Stay Updated with Latest News'
          }
        default: {
          // Handle admin routes
          if (path.startsWith('/admin')) {
            const adminSegments = pathSegments.slice(1) // Remove 'admin'
            const adminTitle = adminSegments.length > 0 
              ? adminSegments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1)).join(' ')
              : 'Admin Panel'
            
            return {
              title: `Admin - ${adminTitle}`,
              breadcrumbs: [
                { label: 'Home', path: '/' },
                { label: 'Admin', path: '/admin' },
                ...adminSegments.map((segment, index) => ({
                  label: segment.charAt(0).toUpperCase() + segment.slice(1),
                  path: `/admin/${adminSegments.slice(0, index + 1).join('/')}`
                }))
              ],
              text: 'Administrative Controls'
            }
          }
          
          // Default fallback
          const title = pathSegments.length > 0 
            ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
            : 'FDFED'
          
          return {
            title,
            breadcrumbs: [
              { label: 'Home', path: '/' },
              { label: title, path }
            ],
            text: 'Real Estate Solutions'
          }
        }
      }
    }

    const pageInfo = generatePageInfo()
    setPageTitle(pageInfo.title)
    setBreadcrumbs(pageInfo.breadcrumbs)
    setDynamicText(pageInfo.text)
  }, [location.pathname])

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{pageTitle}</h1>
        
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="breadcrumb-item">
                {index === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link to={crumb.path} className="breadcrumb-link">
                      {crumb.label}
                    </Link>
                    <span className="breadcrumb-separator">
                      <i className="fas fa-chevron-right"></i>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Dynamic Text */}
        <p className="dynamic-text">{dynamicText}</p>
      </div>
      
      {/* Background Illustration */}
      <div className="header-illustration" role="presentation"></div>
    </header>
  )
}

export default Header