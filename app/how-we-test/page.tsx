import type { Metadata } from "next";
import { Newsletter } from "@/components/chrome";

export const metadata: Metadata = {
  title: "How we test",
  description: "Lab scores are not published yet. This page is the protocol plan and the signup for the first results.",
};

export default function HowWeTestPage() {
  return (
    <div className="wrap prose" style={{ padding: "1.2rem 0 2rem" }}>
      <p className="kicker">Method · PGL-REV-1</p>
      <h1>How we test</h1>
      <p>
        Protocol Golf Lab is a measurement bench. The owner does this for a living as a test engineer. The golf protocols are not signed off yet, so this site will not print a lab score and call it data.
      </p>
      <h2>What a score will be</h2>
      <p>
        A score will be the output of a written protocol: a setup, a sample size, the instruments, the pass-fail or the scale, and the date. The same page that shows the price will show the score, with the method attached. Until that exists, the badge says coming soon. There is no placeholder number behind it.
      </p>
      <h2>What is published now</h2>
      <p>
        Specs are copied only when a manufacturer or a major retailer page states them. If the page does not say, the cell is blank. Prices are the figure in the product record or on the product page, with the URL and the day that page was read. A compare-at price is shown when that same record has one.
      </p>
      <p>
        Three-year cost is the checked price plus three years of a subscription only when the maker says the subscription is required and publishes the annual price. An optional plan is shown beside that figure. It is not added in. GSPro publishes its own software price, $250 a year, on its supported-monitor page. That is not a launch-monitor subscription, so it is not inside the 3-year device cost.{" "}
        <a href="/go/gspro-supported-list">The list is here.</a>
      </p>
      <h2>What this is not</h2>
      <p>
        Yardstick Golf asks owners what they think. SimCosts, Golf Sim Caddie, and MyGolfSpy publish their own mix of prices, surveys, and tests. None of that is copied onto this sheet. Owner reports here are separate from lab data. They wait in a review queue. A visitor cannot publish one by submitting the form.
      </p>
      <h2>The order of work</h2>
      <p>
        Mats and launch monitors are first because that is the home-simulator wedge. The tables are generic on purpose. Clubs, balls, shafts, grips, and training aids are another category row with its own spec fields, not a new site. The protocol for each category gets written before any score for that category is shown.
      </p>
      <div className="sheet">
        <p className="kicker">First results</p>
        <p>Leave an email if you want the first batch when a protocol is actually done.</p>
        <Newsletter source="protocol" />
      </div>
    </div>
  );
}
