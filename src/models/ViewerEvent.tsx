enum ViewerEventType {
  FOLLOW = 0,
}

enum ViewerEventSource {
  TWITCH = 'Twitch'
}

interface ViewerEvent {
  type: ViewerEventType
  source: ViewerEventSource
  userName: string
  timestamp: string
}

export {
  type ViewerEvent,
  ViewerEventType,
  ViewerEventSource
}
