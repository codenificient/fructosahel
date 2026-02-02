import { test as base, expect } from "@playwright/test";
import {
  LandingPage,
  DemoPage,
  DemoFarmsPage,
  DemoFinancePage,
  DemoCalendarPage,
  DemoAgentsPage,
  BlogPage,
  AboutPage,
  ContactPage,
} from "../pages";

/**
 * Extended test fixtures with page objects
 */
type FructoSahelFixtures = {
  landingPage: LandingPage;
  demoPage: DemoPage;
  demoFarmsPage: DemoFarmsPage;
  demoFinancePage: DemoFinancePage;
  demoCalendarPage: DemoCalendarPage;
  demoAgentsPage: DemoAgentsPage;
  blogPage: BlogPage;
  aboutPage: AboutPage;
  contactPage: ContactPage;
};

/**
 * Custom test with page object fixtures
 */
export const test = base.extend<FructoSahelFixtures>({
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },

  demoPage: async ({ page }, use) => {
    const demoPage = new DemoPage(page);
    await use(demoPage);
  },

  demoFarmsPage: async ({ page }, use) => {
    const demoFarmsPage = new DemoFarmsPage(page);
    await use(demoFarmsPage);
  },

  demoFinancePage: async ({ page }, use) => {
    const demoFinancePage = new DemoFinancePage(page);
    await use(demoFinancePage);
  },

  demoCalendarPage: async ({ page }, use) => {
    const demoCalendarPage = new DemoCalendarPage(page);
    await use(demoCalendarPage);
  },

  demoAgentsPage: async ({ page }, use) => {
    const demoAgentsPage = new DemoAgentsPage(page);
    await use(demoAgentsPage);
  },

  blogPage: async ({ page }, use) => {
    const blogPage = new BlogPage(page);
    await use(blogPage);
  },

  aboutPage: async ({ page }, use) => {
    const aboutPage = new AboutPage(page);
    await use(aboutPage);
  },

  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await use(contactPage);
  },
});

export { expect };
