import React, { type ReactElement, useEffect } from 'react'
import { type ViewerEvent, ViewerEventType } from '../models/ViewerEvent'

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
  show?: boolean
  customizeOptions: CustomizeOptions
  // move audio here??
}

function Notification (props: Props): ReactElement {
  const [show, setShow] = React.useState(props.show)

  useEffect(() => {
    setShow(props.show)
  }, [props.show])

  const style = {
    'color': props.customizeOptions.color
  }

  // TODO much more robust function for determining message text.
  // Should be way more configurable and handle other EventTypes (channel.update, channel.subscribe, cheer etc.)
  const eventMsg = props.viewerEvent?.type === ViewerEventType.FOLLOW ? `Thanks for following, ${props.viewerEvent?.userName ?? 'SAMPLE USER'}!` : 'UNKNOWN EVENT TYPE'

  return (
        <div className={show !== undefined && show ? 'notification-show' : 'notification-hide'} data-testid="notification-elt">
             <h1 className="NotificationText" style={style}>{eventMsg}</h1>
         </div>
  )
}

export default Notification
export type { CustomizeOptions }