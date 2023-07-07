import React, { type ReactElement, useEffect, useState } from 'react'
import { type ViewerEvent, ViewerEventType, ViewerEventSource } from '../models/ViewerEvent'

interface CustomizeOptions {
  color: string | undefined
  audioFileName: string | undefined
}

class CustomizeOptions implements CustomizeOptions {
  constructor(color: string = "", audioFileName: string = "") {
    this.color = color
    this.audioFileName = audioFileName
  }
}

interface Props {
  viewerEvent?: ViewerEvent
  customizeOptions: CustomizeOptions
  // move audio here??
}

function Notification (props: Props): ReactElement {
  const [prevEvent, setPrevEvent] = useState(undefined as undefined | ViewerEvent)

  // When we receive an event, keep track of it so when the event from props is unset (notification is hidden)
  // we can smoothly transition out without suddenly changing text to something else.
  useEffect(() => {
    if(props.viewerEvent !== undefined) {
      setPrevEvent(props.viewerEvent)
    }
  }, [props])

  const style = {
    'color': props.customizeOptions.color
  }

  const getEventText = function(): string {
    if(props.viewerEvent !== undefined) {
      return formatMessage(props.viewerEvent)
    } else if (prevEvent !== undefined) {
      return formatMessage(prevEvent)
    }
    return ""
  }

  const formatMessage = function(event: ViewerEvent): string {
    switch(event.type) {
      case ViewerEventType.FOLLOW:
        return `Thanks for following, ${event.userName}!`
      default: // TODO better default?
        return `Thanks for doing the thing, ${event.userName}!`
    }
  }

  return (
    <div className={`container notification-${props.viewerEvent ? 'show':'hide'}`} data-testid="notification-elt">
          <h1 className="NotificationText" style={style}>{getEventText()}</h1>
      </div>
  )
}

export default Notification
export type { CustomizeOptions }