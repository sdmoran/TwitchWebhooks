import React, { useEffect } from 'react';
import { ViewerEvent, ViewerEventType } from '../models/ViewerEvent';

interface Props {
    viewerEvent?: ViewerEvent
    show?: boolean
}

function Notification(props: Props) {
    const [show, setShow] = React.useState(props.show);

    useEffect(() => {
        setShow(props.show)
    });

    // TODO much more robust function for determining message text.
    // Should be way more configurable and handle other EventTypes (channel.update, channel.subscribe, cheer etc.)
    let eventMsg = props.viewerEvent?.type == ViewerEventType.FOLLOW ? `Thanks for following, ${props.viewerEvent?.userName ?? "SAMPLE USER"}!` : "UNKNOWN EVENT TYPE"

    return (
        <div className={show ? 'notification-show' : 'notification-hide'}>
             <h1 className="NotificationText">{eventMsg}</h1>
         </div>
    )
}

export default Notification;