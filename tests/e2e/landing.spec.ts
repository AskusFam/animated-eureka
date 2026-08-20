import { expect, test } from "@playwright/test";

test("landing page explains the concierge", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /trips worth the group chat/i })).toBeVisible();
  await expect(page.getByText("A better way")).toBeVisible();
  await expect(page.getByRole("link", { name: /text rally/i }).first()).toHaveAttribute("href", /sms:.+\?body=RALLY%20WEB%20PLAN/);
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

test("traveler can save a progressive profile", async ({ page }) => {
  await page.goto("/onboarding?phone=%2B15551234567");
  await page.getByLabel("Name").fill("Alex Morgan");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByLabel("Home base").fill("Boston, MA");
  await page.getByLabel("Time zone").fill("America/New_York");
  await page.getByRole("button", { name: "Food and culture" }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
});

test("trip workspace shows the agent roadmap", async ({ page, request }) => {
  const response = await request.post("/api/trips", {
    data: { name: "Kyoto spring trip", destination: "Kyoto", organizerName: "Alex", organizerPhone: "+15551234567" },
  });
  const trip = await response.json();
  const workspaceResponse = await request.get(`/api/trips/${trip.id}`);
  expect(workspaceResponse.ok()).toBeTruthy();
  await page.goto(`/trips/${trip.id}`);
  await expect(page.getByText("RallyUp’s next move")).toBeVisible();
  await expect(page.getByText("Research destinations and options around the group’s intent.")).toBeVisible();
});

test("trip decision page supports staged voting and a daily itinerary", async ({ page, request }) => {
  const response = await request.post("/api/trips", {
    data: { name: "Nashville group trip", destination: "Nashville", organizerName: "Alex", organizerPhone: "+15551234567" },
  });
  const trip = await response.json();
  await page.goto(`/trips/${trip.id}/plan`);
  await expect(page.getByRole("heading", { name: "Pick the direction" })).toBeVisible();
  await page.getByRole("button", { name: "Pick this direction" }).first().click();
  await expect(page.getByRole("heading", { name: "Choose the base" })).toBeVisible();
  await page.getByRole("button", { name: "Pick this direction" }).first().click();
  await expect(page.getByRole("heading", { name: "Set the rhythm" })).toBeVisible();
  await page.getByRole("button", { name: "Pick this direction" }).first().click();
  await page.getByRole("button", { name: /build the daily itinerary/i }).click();
  await expect(page.getByRole("heading", { name: /a considered group itinerary/i })).toBeVisible();
  await expect(page.getByText("Day 1")).toBeVisible();
});
