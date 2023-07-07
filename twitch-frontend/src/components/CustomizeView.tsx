import React, { type ReactElement, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { ViewerEventSource, ViewerEventType } from '../models/ViewerEvent'
import { writeNotificationOptions } from '../state/Cookies'
import Notification, { type CustomizeOptions } from './Notification'

function CustomizeView (): ReactElement {
  const [color, _setColor] = useState('#aabbcc')

  const setColor = function (color: string): void {
    _setColor(color)
    setOptionsModified(true)
  }

  const options: CustomizeOptions = {
    color,
    audioFileName: ''
  }

  // Keep track of if options have changed
  const [optionsModified, setOptionsModified] = useState(false)

  const event = {
    type: ViewerEventType.FOLLOW,
    source: ViewerEventSource.TWITCH,
    userName: 'Sample User',
    timestamp: 'now'
  }

  return (
        <div className="Customize">
            <div className="container">
                <h1>Customize</h1>
                <p>Choose some options for how you want your notification to appear below.</p>
                <p>Once you are happy with how the notification looks, click the button to save. Your selections will be applied on the Notifications page.</p>
                <h2>Preview</h2>
                <Notification viewerEvent={event} customizeOptions={options} />

                <h2>Color Selector</h2>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center' }}>
                    <HexColorPicker color={color} onChange={setColor} />
                    <input value={color} onChange={e => { setColor(e.target.value) }}/>

                    {optionsModified ? 'Unsaved changes!' : 'Changes saved!'}

                    <button onClick={() => {
                      writeNotificationOptions(options)
                      setOptionsModified(false)
                    }}>
                    Save Settings
                    </button>
                </div>

            </div>
        </div>
  )
}

export default CustomizeView
