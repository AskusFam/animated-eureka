import { expect, test } from "@playwright/test";

test("landing page explains the concierge", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your group trip/i })).toBeVisible();
  await expect(page.getByText("Text first")).toBeVisible();
  await expect(page.getByRole("link", { name: /open prototype dashboard/i })).toBeVisible();
});

test("organizer can create a trip from the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByLabel("Trip name").fill("Lisbon fall trip");
  await page.getByLabel("Destination").fill("Lisbon, Portugal");
  await page.getByLabel("Your name").fill("Alex");
  await page.getByLabel("Your phone").fill("+15551234567");
  await page.getByRole("button", { name: "Create trip" }).click();
  await expect(page.getByRole("status")).toContainText("Trip created: Lisbon fall trip");
});

test("trip API creates a participant invitation", async ({ request }) => {
  const tripResponse = await request.post("/api/trips", {
    data: { name: "API trip", destination: "Tokyo", organizerName: "Alex", organizerPhone: "+15551234567" },
  });
  expect(tripResponse.ok()).toBeTruthy();
  const trip = await tripResponse.json();

  const inviteResponse = await request.post(`/api/trips/${trip.id}/participants`, {
    data: { name: "Sam", phoneNumber: "+15557654321" },
  });
  expect(inviteResponse.status()).toBe(201);
  const invite = await inviteResponse.json();
  expect(invite.participant.phoneNumber).toBe("+15557654321");
  expect(invite.reminder.kind).toBe("invitation");
});
