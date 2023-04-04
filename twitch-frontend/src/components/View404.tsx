import React, { type ReactElement } from 'react'
import { Link } from 'react-router-dom'

function View404 (): ReactElement {
  return (
        <div className="container">
            <h1>404 Page Not Found</h1>
            <h2><Link to={'/'}>Click here to go home.</Link></h2>
        </div>
  )
}

export default View404
