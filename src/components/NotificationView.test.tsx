import { render, screen, waitFor } from "@testing-library/react";
import { createBrowserRouter, MemoryRouter, Router, RouterProvider } from "react-router-dom";
import { NotificationView, twitchUserIdLoader } from "./NotificationView";

// TODO investigate why beforeEach() does not seem to properly create new instances of router.
// This is the only way I have found so far to have router behave as expected for each test.
function getRouter() {
    return createBrowserRouter(
        [{
          path: "/:twitchUserId",
          element: <NotificationView />,
          loader: twitchUserIdLoader
        }]
    );
}

test("Renders NotificationView with a valid Twitch User ID", async () => {
    const router = getRouter();
    router.navigate("/61744666")
    render(
        <RouterProvider router={router} />
    );
    const testMsg = await waitFor(() => screen.getByText("Thanks for following, Sample User!"))
    expect(testMsg).toBeInTheDocument();
});

test("NotificationView shows error message with invalid Twitch User ID", async () => {
    const router = getRouter();
    router.navigate("/aaaaaaa")
    render(
        <RouterProvider router={router} />
    );
    const failMessage = await waitFor(() => screen.getByText("An error occurred: SubscriptionSetupFailed"))
    expect(failMessage).toBeInTheDocument();
});