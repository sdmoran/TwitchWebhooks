import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SetupView from "./SetupView";
import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";

const TOKEN = process.env.REACT_APP_TWITCH_TOKEN || "fake_token";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "fake_client_id";

const router = createBrowserRouter([
    {
      path: "/",
      element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
    },
]);

test("Handles error gracefully if Twitch username not found", async () => {
    render(<RouterProvider router={router} />);
    await userEvent.click(screen.getByText("Get User ID"))
    const failMessage = await waitFor(() => screen.getByText("Failed to get User ID from Twitch: Invalid login names, emails or IDs in request"))
    expect(failMessage).toBeInTheDocument();
  });
  
test("Submitting valid username displays Twitch user information for that user", async () => {
    render(<RouterProvider router={router} />);
    await userEvent.paste(screen.getByPlaceholderText("Twitch Username"), "mrmannertink");
    await userEvent.click(screen.getByText("Get User ID"))
    const twitchUserName = await waitFor(() => screen.getByText("MrMannertink"));
    expect(twitchUserName).toBeInTheDocument();
    const twitchUserId = screen.getByText("User ID: 61744666");
    expect(twitchUserId).toBeInTheDocument();
});

// TODO Add tests for image? May require some custom querySelector shenanigans
