import React, { type ReactElement } from 'react'

interface IUserInfoProps {
  user: any
}

function UserInfoCard (props: IUserInfoProps): ReactElement {
  return (
        <div className="HorizontalCardContainer UserInfoCard">
            <div className="UserThumbnail">
                <img src={props.user.profile_image_url} className="UserProfileImage"/>
            </div>
            <div className="UserProperties">
                <h1>{props.user.display_name}</h1>
                <h2>User ID: {props.user.id}</h2>
            </div>
        </div>
  )
}

export default UserInfoCard
