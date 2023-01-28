import { useState } from "react"
import { SubscriptionOption } from "../models/Twitch"

interface ISubscriptionSelectorProps {
    subscriptionTypes: SubscriptionOption[]
}

function SubscriptionSelector(props: ISubscriptionSelectorProps ) {
    let [subscriptions, setSubscriptions] = useState(props.subscriptionTypes);

    function handleChange(e: any, data: SubscriptionOption, idx: number) {
        data.selected = !data.selected
        const newSubs = [...subscriptions]
        newSubs[idx] = data // TODO check index in bounds
        setSubscriptions(newSubs)
    }

    const elts = props.subscriptionTypes.map((elt, idx) => {
        return (
            <div className="HorizontalCardContainer" key={elt.type}>
                <button className={elt.selected ? "ToggleButton noselect active" : "ToggleButton noselect"} onClick={(e) => { handleChange(e, elt, idx)}}>
                    {elt.friendlyName}
                </button>
            </div>
        )
    });

    const selectedEventsList = props.subscriptionTypes.map((elt) => {
        if (elt.selected) {
            return (
                <li key={elt.type}>{elt.friendlyName}</li>
            )
        }
    })

    const selectedEventsDisplay = props.subscriptionTypes.filter(
        (elt) => {return elt.selected}).length > 0 
        ? <ul>{selectedEventsList}</ul>
        : <p>No events selected yet, choose some from above!</p>

    return (
        <div className="SubscriptionSelector">
            <h2>Events to Watch</h2>
            <p>Select the events from the list below that you want to receive notifications for.</p>
            {elts}
            <div className="flex-list">
                <h2>Selected Events</h2>
                {selectedEventsDisplay}
            </div>
        </div>
    )
}

export default SubscriptionSelector;