import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import routeConfig from "../routeConfig";

test("Shows error when no subscriptions are passed in URL parameters", async () => {
    const router = createMemoryRouter(routeConfig, {
        initialEntries: ["/notifications/61744666"]
    })
    render(
        <RouterProvider router={router} />
    );

    const msg = await waitFor(() => screen.getByText("UNKNOWN EVENT TYPE"))
    expect(msg).toBeInTheDocument();
});

test("Renders NotificationView with a valid Twitch User ID and subscription types", async () => {
    const router = createMemoryRouter(routeConfig, {
        initialEntries: ["/notifications/61744666?eventTypes=channel.follow&showTest=1"]
    })
    render(
        <RouterProvider router={router} />
    );

    const msg = await waitFor(() => screen.getByText("UNKNOWN EVENT TYPE"))
    expect(msg).toBeInTheDocument();
    const testMsg = await waitFor(() => document.querySelector(".notification-hide")) // notification hidden if showTest not in query params
    expect(testMsg).toBeInTheDocument();
});

test("Shows test notification when URL parameter is present", async () => {
    const router = createMemoryRouter(routeConfig, {
        initialEntries: ["/notifications/61744666?eventTypes=channel.follow&showTest=1"]
    })

    render(
        <RouterProvider router={router} />
    );

    const testMsg = await waitFor(() => screen.getByText("Thanks for following, Sample User!"))
    expect(testMsg).toBeInTheDocument();
})

test("NotificationView shows error message with invalid Twitch User ID", async () => {
    const router = createMemoryRouter(routeConfig, {
        initialEntries: ["/notifications/aaaaa?eventTypes=channel.follow"]
    })
    render(
        <RouterProvider router={router} />
    );
    const failMessage = await waitFor(() => screen.getByText("An error occurred: SubscriptionSetupFailed"))
    expect(failMessage).toBeInTheDocument();
});