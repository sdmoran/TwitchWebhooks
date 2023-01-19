import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import userEvent from "@testing-library/user-event";

test("Initially renders setup view", () => {
  render(<App />);
  const linkElement = screen.getByText(/setup/i);
  expect(linkElement).toBeInTheDocument();
  const buttonElement = screen.getByText("Get User ID");
  expect(buttonElement).toBeInTheDocument();
});

test("Transitions from SetupView to main view when valid Twitch username submitted", async () => {
    render(<App />);
    await userEvent.paste(screen.getByPlaceholderText("Twitch Username"), "mrmannertink");
    await userEvent.click(screen.getByText("Get User ID"))
    await waitFor(() => screen.getByText("MrMannertink"));
    await userEvent.click(screen.getByText("Subscribe to Follower Notifications"))
    const eventHeading = await screen.getByText("Current Event")
    expect(eventHeading).toBeInTheDocument();
})