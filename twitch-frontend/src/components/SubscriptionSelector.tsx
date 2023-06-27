import React, { type ReactElement, useState } from 'react'
import { type SubscriptionOption } from '../models/Twitch'

interface ISubscriptionSelectorProps {
  subscriptionTypes: SubscriptionOption[]
  setSubscriptionTypes: (scopes: SubscriptionOption[]) => void
}

function SubscriptionSelector (props: ISubscriptionSelectorProps): ReactElement {
  function handleChange (data: SubscriptionOption, idx: number) {
    data.selected = !data.selected
    const newSubs = [...props.subscriptionTypes]
    newSubs[idx] = data // TODO check index in bounds
    props.setSubscriptionTypes(newSubs)
  }

  const elts = props.subscriptionTypes.map((elt, idx) => {
    return (
    <div className="HorizontalCardContainer" key={elt.name}>
        <button className={elt.selected ? 'ToggleButton noselect active' : 'ToggleButton noselect'} onClick={ (e=> handleChange(elt, idx))}>
            {elt.friendlyName}
        </button>
    </div>
    )
  })

  // Get selected events
  const selectedEvents = props.subscriptionTypes.filter((elt) => {
    return elt.selected
  })

  // Get scopes needed for selected events
  const scopes = selectedEvents.reduce<string[]>(
    (acc, elt) => {
      if (elt !== undefined) {
        elt.scopes.forEach(scope => {
          if (!acc.includes(scope)) {
            acc.push(scope)
          }
        })
      }
      return acc
    }, [])

  // TODO maybe combine these 2 into a function. Somewhat different but maybe reusable on dashboardview
  const selectedEventsDisplay = selectedEvents.length > 0
    ? <ul>{selectedEvents.map((elt) => { return elt === undefined ? null : <li key={elt?.name}>{elt?.friendlyName}</li> })}</ul>
    : <p>No events selected yet, choose some from above!</p>

  const selectedScopes = scopes.length > 0
    ? <ul>{scopes.map((elt) => { return elt === undefined ? null : <li key={elt}>{elt}</li> })}</ul>
    : <p>No scopes selected yet</p>

  return (
    <div className="SubscriptionSelector">
        <h2>Events to Watch</h2>
        <p>Select the events from the list below that you want to receive notifications for.</p>
        {elts}
        <div className="flex-list">
            <h2>Selected Events</h2>
            {selectedEventsDisplay}
        </div>
        <div className="flex-list">
            <h2>Required Scopes</h2>
            {selectedScopes}
        </div>
    </div>
  )
}

export default SubscriptionSelector
