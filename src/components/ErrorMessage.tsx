interface Props {
    err: Error
    msg?: string
    detail?: string
}

function ErrorMessage(props: Props) {
    const detail = <p>Details: {props.err.cause as string}</p> || undefined;

    return (
        <div>
            <h1 className="error">An error occurred: {props.err.message}</h1>
            {detail}
        </div>
    )
}

export default ErrorMessage;